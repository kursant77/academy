import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // Barcha ochiq toast'larni yopish (faqat bitta toast ko'rsatilishi uchun)
      const closedToasts = state.toasts.map((t) => ({
        ...t,
        open: false,
      }));
      
      // Agar xuddi shu title (yoki title + description) bilan toast allaqachon mavjud bo'lsa, qo'shmaymiz
      const existingToast = state.toasts.find((t) => {
        if (!t.open) return false;
        // Agar title bir xil bo'lsa
        if (String(t.title) === String(action.toast.title)) {
          // Description ham mavjud bo'lsa, ikkalasini ham tekshiramiz
          if (action.toast.description && t.description) {
            return String(t.description) === String(action.toast.description);
          }
          // Agar description yo'q bo'lsa, faqat title'ni tekshiramiz
          return true;
        }
        return false;
      });
      
      if (existingToast) {
        return state;
      }
      
      return {
        ...state,
        toasts: [action.toast].slice(0, TOAST_LIMIT), // Faqat yangi toast'ni ko'rsatish
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

// Global debounce timer - bir xil toast'lar uchun
let lastToastKey: string | null = null;
let lastToastTime: number = 0;
const TOAST_DEBOUNCE_MS = 1000; // 1 soniya ichida bir xil toast qo'shish mumkin emas

function toast({ ...props }: Toast) {
  const id = genId()
  
  // Toast key yaratish (title + description kombinatsiyasi)
  const toastKey = `${props.title || ''}-${props.description || ''}-${props.variant || 'default'}`;
  const now = Date.now();
  
  // Agar so'nggi toast xuddi shu key va 1 soniya ichida bo'lsa, qo'shmaymiz
  if (lastToastKey === toastKey && (now - lastToastTime) < TOAST_DEBOUNCE_MS) {
    return {
      id: id,
      dismiss: () => {},
      update: () => {},
    };
  }
  
  lastToastKey = toastKey;
  lastToastTime = now;

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
