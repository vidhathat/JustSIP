import { useEffect, useRef } from 'react'

export default function DotBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dotSize = 2
    const dotGap = 20
    const gridSize = dotSize + dotGap

    function updateCanvasSize() {
      if (!canvas) return
      canvas.width = window.innerWidth * window.devicePixelRatio
      canvas.height = window.innerHeight * window.devicePixelRatio

      ctx?.scale(window.devicePixelRatio, window.devicePixelRatio)

      ctx!.fillStyle = '#111111'
      ctx!.fillRect(0, 0, canvas.width, canvas.height)

      ctx!.fillStyle = '#222222'
      for (let x = dotGap; x < canvas.width / window.devicePixelRatio; x += gridSize) {
        for (let y = dotGap; y < canvas.height / window.devicePixelRatio; y += gridSize) {
          ctx!.beginPath()
          ctx!.arc(x, y, dotSize/2, 0, Math.PI * 2)
          ctx!.fill()
        }
      }

      ctx!.fillStyle = '#FF8A00'
      const numOrangeDots = 5
      const orangeDots = []
      
      for (let i = 0; i < numOrangeDots; i++) {
        const x = Math.random() * (canvas.width / window.devicePixelRatio)
        const y = Math.random() * (canvas.height / window.devicePixelRatio)
        
        ctx!.beginPath()
        ctx!.arc(x, y, dotSize, 0, Math.PI * 2)
        ctx!.fill()
        
        const gradient = ctx!.createRadialGradient(x, y, dotSize, x, y, dotSize * 4)
        gradient.addColorStop(0, 'rgba(255, 138, 0, 0.2)')
        gradient.addColorStop(1, 'rgba(255, 138, 0, 0)')
        ctx!.fillStyle = gradient
        ctx!.beginPath()
        ctx!.arc(x, y, dotSize * 4, 0, Math.PI * 2)
        ctx!.fill()
        
        orangeDots.push({ x, y })
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ 
        imageRendering: 'pixelated',
        backgroundColor: '#111111'
      }}
    />
  )
} 