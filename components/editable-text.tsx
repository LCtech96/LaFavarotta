'use client'

import { useState, useEffect, useRef } from 'react'
import { Edit2, Check, X } from 'lucide-react'

interface EditableTextProps {
  value: string
  onSave: (newValue: string) => void
  className?: string
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  multiline?: boolean
}

export function EditableText({ 
  value, 
  onSave, 
  className = '', 
  tag = 'p',
  multiline = false 
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isAdmin, setIsAdmin] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    setIsAdmin(auth === 'true')
  }, [])

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.style.height = 'auto'
        inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
      }
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    if (isAdmin) {
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    onSave(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  if (!isAdmin && !isEditing) {
    const Tag = tag
    return <Tag className={className}>{value}</Tag>
  }

  if (isEditing) {
    return (
      <div className="relative group">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`${className} border-2 border-blue-500 rounded p-2 w-full min-h-[100px] resize-y`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSave()
              }
              if (e.key === 'Escape') {
                handleCancel()
              }
            }}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`${className} border-2 border-blue-500 rounded p-2 w-full`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave()
              }
              if (e.key === 'Escape') {
                handleCancel()
              }
            }}
          />
        )}
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
            title="Salva (Enter)"
          >
            <Check size={16} />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
            title="Annulla (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    )
  }

  const Tag = tag
  return (
    <div 
      className="relative group cursor-pointer"
      onDoubleClick={handleDoubleClick}
      title={isAdmin ? "Doppio click per modificare" : undefined}
    >
      <Tag className={className}>{value}</Tag>
      {isAdmin && (
        <Edit2 
          size={14} 
          className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-blue-500 text-white rounded p-1 transition-opacity" 
        />
      )}
    </div>
  )
}









