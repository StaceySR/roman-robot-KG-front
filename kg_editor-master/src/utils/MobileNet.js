import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'

// 加载预训练的MobileNet模型
async function loadModel () {
  const model = await mobilenet.load()
  return model
}

async function getFeatureVector (model, imagePath) {
  loadImage(imagePath, (error, img) => {
    if (error) {
      console.error('图像加载失败:', error)
      return
    }
    processImage(model, img)
  })
}

async function processImage (model, img) {
  const processedImg = tf.browser.fromPixels(img)
  const batchedImg = processedImg.expandDims(0)
  const predictions = await model.predict(batchedImg)
  const features = await predictions.data()
  processedImg.dispose()
  batchedImg.dispose()
  predictions.dispose()

  console.log('processedImg: ', processedImg)
  console.log('features: ', features)
  return Array.from(features)
}

function loadImage (imagePath, callback) {
  console.log('loadImage: ', imagePath)
  const img = new Image()
  console.log('img: ', img)
  img.onload = () => callback(null, img)
  img.onerror = (error) => callback(error)
  img.src = imagePath
}

export {
  loadModel,
  getFeatureVector
}
