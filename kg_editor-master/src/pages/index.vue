<template>
  <div class="index">
    <v-app>
      <Toolbar :size="size" :graph="graph" :selectedNodeId.sync="selectedNodeId" :selectedEdgeId.sync="selectedEdgeId"></Toolbar>
      <div class="index__main">
        <div
          ref="G6"
          id="G6"
          class="index__main-left"
          :style="{ width: drawer ? '78%' : '100%' }"
        ></div>
        <div class="index__main-right" :style="{ width: drawer ? '25%' : '0' }">
          <Sidebar ref="sidebar" :graph="graph" :selectedNodeId="selectedNodeId" :selectedEdgeId="selectedEdgeId"></Sidebar>
        </div>
      </div>
    </v-app>
  </div>
</template>
<script>
import Toolbar from '@/components/toolbar'
import Sidebar from '@/components/sidebar'
import G6 from '@antv/g6'
import defaultNode from '@/default/default_node'
import defaultEdge from '@/default/default_edge'
import addNode from '@/actions/add_node'
import hoverNode from '@/actions/hover_node'
import addEdge from '@/actions/add_edge'
import selectEdge from '@/actions/select_edge'
import Axios from 'axios'

export default {
  components: {
    Toolbar,
    Sidebar
  },
  data () {
    return {
      drawer: true,
      graph: null,
      selectedNodeId: '',
      selectedEdgeId: '',
      item: {},
      addingEdge: true,
      edge: null,
      size: 100,
      dataList: this.$store.state.dataList,
      socket: null
    }
  },
  created () {
    // 建立 WebSocket 连接到服务器
    const ws = new WebSocket('ws://localhost:8081')

    // 处理收到的 WebSocket 消息
    ws.onmessage = (event) => {
      console.log('Received WebSocket message:', event.data)

      // 解析消息
      try {
        const message = JSON.parse(event.data)
        console.log('Parsed WebSocket message:', message)

        const messageType = message.type
        const payload = message.payload

        // 根据消息类型处理不同类别的数据
        switch (messageType) {
          case 'updateDataList':
          // 在这里处理收到的更新 dataList 的消息并更新页面数据
          // this.dataList.push(payload)
            // this.$store.state.dataList.nodes.push(payload)
            console.log('index.vue: message: ', this.$store.state.dataList)

            let nodeList = payload['nodeList']
            for (let index = 0; index < nodeList.length; index++) {
              const obj = nodeList[index]
              // let obj = payload
              console.log('obj-id-label: ', obj)
              console.log('addItem: ', this.graph.addItem('node', obj))
              this.$store.commit('addNode', obj)
              // 操作记录
              let logObj = {
                id: String('log' + (this.$store.state.log.length + 1)),
                action: 'addNode',
                data: obj
              }
              this.$store.commit('addLog', logObj)
            }
            let edgeList = payload['edgeList']
            for (let index = 0; index < edgeList.length; index++) {
              const edge = edgeList[index]
              this.graph.addItem('edge', edge)
              this.$store.commit('addEdge', edge)
              // 操作记录
              let logObj = {
                id: String('log' + (this.$store.state.log.length + 1)),
                action: 'addEdge',
                data: edge
              }
              this.$store.commit('addLog', logObj)
            }
            break
          case 'initDataList':
          // 将获取到的初始化数据信息通过graph.read呈现到网页上
            this.$store.state.dataList = payload
            this.graph.read(this.$store.state.dataList)
            break
          case 'otherMessageType':
          // 在这里处理其他类型的消息
          // ...
            break
            // 可以根据需要添加更多的消息类型
            // ...
          default:
            console.log('Unknown message type:', messageType)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }
  },
  mounted () {
    this.initG6()

    // 发起 GET 请求获取 初始化 数据
    this.fetchData()
  },
  methods: {
    initG6 () {
      G6.registerBehavior('hover-node', hoverNode)
      // 双击添加节点
      G6.registerBehavior('click-add-node', addNode)
      // 添加连线
      G6.registerBehavior('click-add-edge', addEdge)
      G6.registerBehavior('select-edge', selectEdge)
      let grid = new G6.Grid()
      // 缩略图
      let minimap = new G6.Minimap({
        container: this.$refs.sidebar.$refs.minimap,
        size: [
          this.$refs.sidebar.$refs.minimap.offsetWidth - 8,
          this.$refs.sidebar.$refs.minimap.offsetHeight
        ]
      })
      this.graph = new G6.Graph({
        container: 'G6',
        width: this.$refs.G6.offsetWidth,
        height: this.$refs.G6.offsetHeight,
        plugins: [grid, minimap],
        layout: {
          // type: 'force',
          // 初始布局形式
          type: 'circular',
          nodeStrength: -30,
          preventOverlap: true,
          nodeSize: 40,
          edgeStrength: 0.1,
          linkDistance: 100
        },
        modes: {
          default: [
            'hover-node',
            'zoom-canvas', // 缩放canvas
            'drag-canvas', // 拖拽canvas
            {
              type: 'drag-node' // 拖拽node
            },
            'click-add-node',
            'click-select',
            'select-edge'
          ],
          addEdge: [
            'click-add-edge',
            'hover-node',
            'zoom-canvas',
            'drag-canvas',
            'click-add-node'
          ]
        },
        defaultNode: defaultNode,
        defaultEdge: defaultEdge,
        edgeStateStyles: {
          hover: {
            stroke: '#409eff' // 颜色
          },
          selected: {
            stroke: '#409eff' // 颜色
          }
        },
        nodeStateStyles: {
          selected: {
            stroke: '#409eff',
            lineWidth: 1,
            fill: '#409eff'
          }
        }
      })
      // this.graph.read(this.$store.state.dataList)
      this.graph.on('nodeselectchange', (e) => {
        this.item = e
        this.selectedEdgeId = ''
        this.selectedNodeId = e.select ? e.selectedItems.nodes[0]._cfg.id : ''
      })
      this.graph.on('edge:click', (e) => {
        this.selectedNodeId = ''
        this.selectedEdgeId = e.item._cfg.id
      })
      this.graph.on('canvas:click', (e) => {
        this.selectedNodeId = ''
        this.selectedEdgeId = ''
      })
      this.graph.on('viewportchange', (e) => {
        if (e.action === 'zoom') {
          this.size = Number((Number(this.graph.getZoom()) * 100).toFixed(0))
        }
      })
    },
    fetchData () {
      Axios.get('http://localhost:8080/api/getData')
        .then((response) => {
          // 请求成功，将获取的数据更新到 dataList
          // this.dataList = response.data
          console.log('index.vue: fetchData success!')
          this.$store.state.dataList = response.data
          this.graph.read(this.$store.state.dataList)
          console.log('fetchData: response.data: ', this.$store.state.dataList)
          console.log('fetchData: response.data: ', response.data)
        })
        .catch((error) => {
          console.error('Error fetching data:', error)
        })
    }
  }
}
</script>
<style lang="less" scoped>
.index {
  width: 100%;
  &__main {
    width: 100%;
    margin-top: 40px;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    &-left {
      height: 88vh;
      border: 2px solid #3333;
      margin: 2vw 2vw 0 2vw;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    }
    &-right {
      height: 88vh;
      border: 1px solid #3333;
      margin-top: 2vw;
      margin-right: 10px;
      overflow-y: scroll;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
      &__pot {
        position: absolute;
        width: 2vw;
        height: 2vw;
        background: #35495e;
        border-radius: 1vw;
        clip: rect(0px 1vw 2vw 0px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
        top: 50%;
        cursor: pointer;
        z-index: 1000 !important;
      }
      &__pot:hover {
        background: #dcdfe6;
      }
    }
  }
}
.g6-tooltip {
  padding: 10px 6px;
  color: #444;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e2e2;
  border-radius: 4px;
}
</style>
