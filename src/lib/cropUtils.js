export const getCroppedImg = (imageSrc, pixelCrop) => {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.src = imageSrc
        image.crossOrigin = 'anonymous' // Enable CORS if needed

        image.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            canvas.width = pixelCrop.width
            canvas.height = pixelCrop.height

            // Preencher com fundo branco (garantir que não haja transparência)
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height
            )

            // Retorna como DataURL (base64)
            resolve(canvas.toDataURL('image/jpeg', 0.95))
        }

        image.onerror = (error) => {
            reject(error)
        }
    })
}
