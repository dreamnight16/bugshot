import { useCallback, useEffect } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import Annotator from './components/Annotator'
import Toolbar from './components/Toolbar'
import PinSidebar from './components/PinSidebar'
import { AppProvider, useAppState } from './context/AppContext'
import { usePins } from './hooks/usePins'
import { useDrawings } from './hooks/useDrawings'
import { useHistory } from './hooks/useHistory'
import type { Session, CaptureMode } from './types'

function genId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function AppInner() {
  const { state, dispatch } = useAppState()
  const { activeTool, selectedPinId, selectedDrawingId, sessions, activeSessionId } = state

  const activeSession = sessions.find(s => s.id === activeSessionId) ?? null

  const pins = usePins()
  const drawings = useDrawings()
  const history = useHistory()

  // Listen for screenshots from Electron main process
  useEffect(() => {
    window.electronAPI?.onScreenshot((data) => {
      pins.reset()
      drawings.reset()
      history.reset()
      const newSession: Session = {
        id: genId(),
        screenshot: data.screenshot,
        pins: [],
        drawings: [],
        windowName: data.windowName,
        capturedAt: Date.now(),
        status: 'active',
      }
      dispatch({ type: 'ADD_SESSION', session: newSession })
    })
  }, [])

  // Sync session pins/drawings state for MCP
  useEffect(() => {
    if (!activeSession) return
    const sessionJson = JSON.stringify({
      screenshot: activeSession.screenshot,
      windowName: activeSession.windowName,
      pins: JSON.stringify(pins.items),
      drawings: JSON.stringify(drawings.items),
    })
    window.electronAPI?.updateAnnotations(sessionJson)
  }, [activeSession, pins.items, drawings.items])

  // Load persisted annotations on startup
  useEffect(() => {
    window.electronAPI?.getAnnotations().then((data: unknown) => {
      if (data && typeof data === 'object') {
        const d = data as { screenshot?: string; windowName?: string; pins?: string; drawings?: string }
        if (d.screenshot) {
          const parsedPins = JSON.parse(d.pins || '[]')
          const parsedDrawings = JSON.parse(d.drawings || '[]')
          pins.setAll(parsedPins)
          drawings.setAll(parsedDrawings)
          dispatch({
            type: 'ADD_SESSION',
            session: {
              id: genId(),
              screenshot: d.screenshot,
              pins: parsedPins,
              drawings: parsedDrawings,
              windowName: d.windowName || '',
              capturedAt: Date.now(),
              status: 'active',
            },
          })
        }
      }
    })
  }, [])

  const handleCanvasClick = useCallback(async (x: number, y: number) => {
    dispatch({ type: 'SELECT_DRAWING', id: null })
    if (activeTool === 'pin') {
      history.pushState(pins.items, drawings.items)
      const pin = await pins.add(x, y)
      dispatch({ type: 'SELECT_PIN', id: pin.id })
    }
  }, [activeTool, pins, drawings, history])

  const handleDrawingStart = useCallback(() => {
    if (activeTool !== 'pin') {
      history.pushState(pins.items, drawings.items)
    }
  }, [activeTool, pins.items, drawings.items, history])

  const handleDrawingEnd = useCallback((drawing: { type: string; points: { x: number; y: number }[] }) => {
    if (activeTool !== 'pin') {
      drawings.add(drawing.type as 'arrow' | 'rectangle' | 'freehand', drawing.points)
    }
  }, [activeTool, drawings])

  const handleUndo = useCallback(() => {
    const prev = history.undo()
    if (prev) {
      pins.setAll(prev.pins)
      drawings.setAll(prev.drawings)
    }
  }, [history, pins, drawings])

  const handleRedo = useCallback(() => {
    const next = history.redo()
    if (next) {
      pins.setAll(next.pins)
      drawings.setAll(next.drawings)
    }
  }, [history, pins, drawings])

  const handleClearAll = useCallback(() => {
    history.pushState(pins.items, drawings.items)
    pins.reset()
    drawings.reset()
    dispatch({ type: 'DESELECT_ALL' })
  }, [pins.items, drawings.items, history])

  const handleNewCapture = useCallback((mode: CaptureMode) => {
    window.electronAPI?.captureScreen(mode)
  }, [])

  const handlePinUpdate = useCallback((id: string, updates: Parameters<typeof pins.update>[1]) => {
    history.pushState(pins.items, drawings.items)
    pins.update(id, updates)
  }, [pins, drawings, history])

  const handlePinDelete = useCallback((id: string) => {
    history.pushState(pins.items, drawings.items)
    pins.remove(id)
    dispatch({ type: 'DESELECT_ALL' })
  }, [pins, drawings, history])

  const handleDrawingDelete = useCallback((id: string) => {
    history.pushState(pins.items, drawings.items)
    drawings.remove(id)
    dispatch({ type: 'DESELECT_ALL' })
  }, [pins.items, drawings.items, history])

  if (!activeSession) {
    return <WelcomeScreen onCapture={handleNewCapture} />
  }

  return (
    <div className="flex flex-col h-screen">
      <Toolbar
        activeTool={activeTool}
        onToolChange={(tool) => dispatch({ type: 'SET_TOOL', tool })}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onNewCapture={handleNewCapture}
        onClearAll={handleClearAll}
        session={activeSession}
        pins={pins.items}
        drawings={drawings.items}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <Annotator
            session={activeSession}
            activeTool={activeTool}
            pins={pins.items}
            drawings={drawings.items}
            selectedPinId={selectedPinId}
            selectedDrawingId={selectedDrawingId}
            onCanvasClick={handleCanvasClick}
            onPinUpdate={handlePinUpdate}
            onPinDelete={handlePinDelete}
            onPinSelect={(id) => dispatch({ type: 'SELECT_PIN', id })}
            onDrawingSelect={(id) => dispatch({ type: 'SELECT_DRAWING', id })}
            onDrawingStart={handleDrawingStart}
            onDrawingEnd={handleDrawingEnd}
            onToolChange={(tool) => dispatch({ type: 'SET_TOOL', tool })}
            onDeselectAll={() => dispatch({ type: 'DESELECT_ALL' })}
          />
        </div>
        <PinSidebar
          pins={pins.items}
          drawings={drawings.items}
          selectedPinId={selectedPinId}
          selectedDrawingId={selectedDrawingId}
          onPinSelect={(id) => dispatch({ type: 'SELECT_PIN', id })}
          onDrawingSelect={(id) => dispatch({ type: 'SELECT_DRAWING', id })}
          onPinUpdate={(id, comment) => pins.update(id, { comment })}
          onPinDelete={handlePinDelete}
          onDrawingUpdate={(id, comment) => drawings.update(id, { comment })}
          onDrawingDelete={handleDrawingDelete}
        />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
