import { useEffect, useState } from 'react';

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updatePosition = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e) => {
            if (e.target.tagName.toLowerCase() === 'button' ||
                e.target.closest('button') ||
                e.target.tagName.toLowerCase() === 'a' ||
                getComputedStyle(e.target).cursor === 'pointer') {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', updatePosition);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', updatePosition);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <>
            {/* Outer trailing circle */}
            <div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-accentOrg pointer-events-none z-[9999] transition-transform duration-300 ease-out hidden md:block mix-blend-screen"
                style={{
                    transform: `translate(${position.x - 16}px, ${position.y - 16}px) scale(${isHovering ? 1.5 : 1})`,
                    opacity: isHovering ? 0.5 : 0.8
                }}
            />
            {/* Inner dot */}
            <div
                className="fixed top-0 left-0 w-2 h-2 rounded-full bg-accentOrg pointer-events-none z-[9999] transition-transform duration-75 block shadow-[0_0_10px_#ff6b35]"
                style={{
                    transform: `translate(${position.x - 4}px, ${position.y - 4}px)`
                }}
            />
        </>
    );
}
