import dagre from 'dagre';
import { Position, useVueFlow } from '@vue-flow/core'
export function useLayout() {
    const { findNode, setNodes } = useVueFlow()

    function layout(nodes, edges) {
        const dagreGraph = new dagre.graphlib.Graph()
        dagreGraph.setGraph({ rankdir: 'TB', nodesep: 200, ranksep: 100 }) // 'TB' 从上到下布局
        dagreGraph.setDefaultEdgeLabel(() => ({}))

        // 1. 设置节点
        for (const node of nodes) {
            const graphNode = findNode(node.id)
            dagreGraph.setNode(node.id, { width: graphNode?.dimensions.width || 160, height: graphNode?.dimensions.height || 50 })
        }

        // 2. 设置边
        for (const edge of edges) {
            dagreGraph.setEdge(edge.source, edge.target)
        }

        // 3. 执行布局计算
        dagre.layout(dagreGraph)

        // 4. 根据类型排序和位置调整
        let centerX = 400 // 居中
        let currentY = 0

        const starterNodes = nodes.filter(node => node.type === 'starter')
        const nodeNodes = nodes.filter(node => node.type === 'node')
        const modelNodes = nodes.filter(node => node.type === 'model')
        const polymerNodes = nodes.filter(node => node.type === 'polymer')
        const algorithmNodes = nodes.filter(node => node.type === 'algorithm')

        function setNodePosition(nodeList, isHorizontal) {
            if (nodeList.length > 0) {
                let offsetX = isHorizontal ? centerX - (nodeList.length * 180) / 2 : centerX // 计算水平或垂直居中位置
                nodeList.forEach((node, index) => {
                    const { x, y } = dagreGraph.node(node.id)
                    node.position = {
                        x: isHorizontal ? offsetX + index * 180 : centerX,
                        y: currentY + y,
                    }
                })
                currentY += nodeList[0].dimensions.height + 120 // 更新 Y 位置，保持间距
            }
        }

        setNodePosition(starterNodes, false) // starter 居中
        setNodePosition(nodeNodes, true) // 多个 node 节点水平排列
        setNodePosition(modelNodes, false) // model 居中
        setNodePosition(polymerNodes, false) // polymer 居中
        setNodePosition(algorithmNodes, false) // algorithm 居中

        // 触发 Vue Flow 更新
        setNodes([...nodes])
    }

    return { layout }
}