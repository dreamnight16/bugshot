import { createContext, useContext, useReducer, type Dispatch } from 'react'
import type { Tool, Session } from '../types'

interface AppState {
  activeTool: Tool
  sessions: Session[]
  activeSessionId: string | null
  selectedPinId: string | null
  selectedDrawingId: string | null
}

type AppAction =
  | { type: 'SET_TOOL'; tool: Tool }
  | { type: 'ADD_SESSION'; session: Session }
  | { type: 'SELECT_PIN'; id: string | null }
  | { type: 'SELECT_DRAWING'; id: string | null }
  | { type: 'DESELECT_ALL' }

const initialState: AppState = {
  activeTool: 'pin',
  sessions: [],
  activeSessionId: null,
  selectedPinId: null,
  selectedDrawingId: null,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TOOL':
      return { ...state, activeTool: action.tool }
    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [...state.sessions, action.session],
        activeSessionId: action.session.id,
      }
    case 'SELECT_PIN':
      return { ...state, selectedPinId: action.id, selectedDrawingId: null }
    case 'SELECT_DRAWING':
      return { ...state, selectedDrawingId: action.id, selectedPinId: null }
    case 'DESELECT_ALL':
      return { ...state, selectedPinId: null, selectedDrawingId: null }
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: Dispatch<AppAction>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}
