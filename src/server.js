const express = require('express')

const app = express()
const PORT = 5000

app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'GRIDPULSE-V backend is running'
  })
})

app.listen(PORT, () => {
  console.log('GRIDPULSE-V backend running on http://localhost:${PORT})')
})