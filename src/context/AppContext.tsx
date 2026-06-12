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
  | { type: 'SET_SESSIONS'; sessions: Session[] }
  | { type: 'ADD_SESSION'; session: Session }
  | { type: 'REMOVE_SESSION'; id: string }
  | { type: 'SET_ACTIVE_SESSION'; id: string | null }
  | { type: 'SELECT_PIN'; id: string | null }
  | { type: 'SELECT_DRAWING'; id: string | null }
  | { type: 'DESELECT_ALL' }
  | { type: 'CLEAR_ALL_ANNOTATIONS' }

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
    case 'SET_SESSIONS':
      return { ...state, sessions: action.sessions }
    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [...state.sessions, action.session],
        activeSessionId: action.session.id,
      }
    case 'REMOVE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(s => s.id !== action.id),
        activeSessionId:
          state.activeSessionId === action.id ? null : state.activeSessionId,
      }
    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSessionId: action.id }
    case 'SELECT_PIN':
      return { ...state, selectedPinId: action.id, selectedDrawingId: null }
    case 'SELECT_DRAWING':
      return { ...state, selectedDrawingId: action.id, selectedPinId: null }
    case 'DESELECT_ALL':
      return { ...state, selectedPinId: null, selectedDrawingId: null }
    case 'CLEAR_ALL_ANNOTATIONS':
      return { ...state }
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
