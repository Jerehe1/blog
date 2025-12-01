import { useState, useRef, useEffect } from 'react'

const Toggle = ({ buttonLabel, children, buttonClass = 'login-box-button', cancelLabel = 'Cancel', cancelButtonClass = 'toggle-form-button' }) => {
  const [visible, setVisible] = useState(false)
  const contentRef = useRef(null)

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  useEffect(() => {
    if (
      visible &&
      contentRef.current &&
      typeof contentRef.current.scrollIntoView === 'function'
    ) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [visible])

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  return (
    <div>
      <div style={hideWhenVisible}>
        <button className={buttonClass} onClick={toggleVisibility}>
          {buttonLabel}
        </button>
      </div>
      <div ref={contentRef} style={showWhenVisible}>
        {typeof children === 'function' ? children(toggleVisibility) : children}
        <button className={cancelButtonClass} onClick={toggleVisibility}>
          {cancelLabel}
        </button>
      </div>
    </div>
  )
}

export default Toggle