import { useState } from "react"

const Toggle = ({ buttonLabel, children, buttonClass = 'login-box-button' }) => {
    const [visible, setVisible] = useState(false)

    const toggleVisibility = () => {
        setVisible(!visible)
    }

    const hideWhenVisible = { display: visible ? 'none' : '' }
    const showWhenVisible = { display: visible ? '' : 'none' }

    return (
        <div>
            <div style={hideWhenVisible}>
                <button className={buttonClass} onClick={toggleVisibility}>
                    {buttonLabel}
                </button>
            </div>
            <div style={showWhenVisible}>
                <button className='toggle-form-button' onClick={toggleVisibility}>
                    Go back
                </button>
                {children}
            </div>
        </div>
    )
}

export default Toggle