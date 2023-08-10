// 找到与这episode image最相似的3张图象
// 计算两个向量之间的欧氏距离
function euclideanDistance (vector1, vector2) {
  let sum = 0
  for (let i = 0; i < vector1.length; i++) {
    sum += Math.pow(vector1[i] - vector2[i], 2)
  }
  return Math.sqrt(sum)
}

// 找到与目标向量最接近的三张图像的索引
function findClosestImages (featureVectors, targetVector) {
  // 读取所有的episode vectors
  const distances = []
  for (let i = 0; i < featureVectors.length; i++) {
    const distance = euclideanDistance(featureVectors[i], targetVector)
    // console.log('distance: ', distance)
    distances.push({ index: i, distance: distance })
  }

  distances.sort((a, b) => a.distance - b.distance)

  console.log('相似度： ', distances[0])
  // 要求相似度达到一定程度，才返回相应的最接近的图像。如果说数量>=3，那么就判定目前的episode是熟悉的，然后将其的特征信息存储进KG

  let theCloestOne = distances[0].distance
  if (theCloestOne >= 0.8) {
    return true
    // 如果最相似的一张大于0.8，或者至少有3张相似度都大于0.5，判定为相似的
  } else {
    if (distances.length >= 3 && distances[2].distance > 0.5) {
      return true
    }
    return false
  }
}
export {
  euclideanDistance,
  findClosestImages
}
