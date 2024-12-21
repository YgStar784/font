import { useVueFlow } from '@vue-flow/core'
import { ElMessage } from 'element-plus'

import { forEach } from 'lodash'
import { ref, watch } from 'vue'
import { MoreFilled, Location, Coin, VideoPause, VideoPlay, Tickets, CaretBottom, CaretRight, Download, Document, Refresh } from '@element-plus/icons-vue';
import { VueFlow, MarkerType } from '@vue-flow/core'
import { e } from 'mathjs';
let id = 0
let nodeValue
let model_id = null
let polymer_id = null
/**
 * @returns {string} - A unique id.
 */
function getId() {
    return `${id++}`;
}

/**
 * In a real world scenario you'd want to avoid creating refs in a global scope like this as they might not be cleaned up properly.
 * @type {{draggedType: Ref<string|null>, isDragOver: Ref<boolean>, isDragging: Ref<boolean>}}
 */
const state = {
    /**
     * The type of the node being dragged.
     */
    draggedType: ref(null),
    isDragOver: ref(false),
    isDragging: ref(false),
}

const { addEdges } =
    useVueFlow()
function isChildNodeInsideParent(childPosition, parentPosition, parentSize, childSize) {
    const { x: parentX, y: parentY } = parentPosition;
    const { width: parentWidth, height: parentHeight } = parentSize;
    const { x: childX, y: childY } = childPosition;
    const { width: childWidth, height: childHeight } = childSize;

    // 判断子节点的四个边是否都在父节点的边界之内
    const isInside =
        childX >= parentX && // 子节点左边 >= 父节点左边
        childX + childWidth <= parentX + parentWidth && // 子节点右边 <= 父节点右边
        childY >= parentY && // 子节点上边 >= 父节点上边
        childY + childHeight <= parentY + parentHeight; // 子节点下边 <= 父节点下边

    return isInside;
}

export default function useDragAndDrop() {
    const { draggedType, isDragOver, isDragging } = state

    const { addNodes, screenToFlowCoordinate, onNodesInitialized, updateNode } = useVueFlow()

    watch(isDragging, (dragging) => {
        document.body.style.userSelect = dragging ? 'none' : ''
    })

    function onDragStart(event, value) {
        if (event.dataTransfer) {
            event.dataTransfer.setData('application/vueflow', value.type)
            event.dataTransfer.effectAllowed = 'move'
        }

        draggedType.value = value.type

        isDragging.value = true
        nodeValue = value
        console.log('draggedType.value', draggedType.value);
        document.addEventListener('drop', onDragEnd)
    }

    /**
     * Handles the drag over event.
     *
     * @param {DragEvent} event
     */
    function onDragOver(event) {
        event.preventDefault()

        if (draggedType.value) {
            isDragOver.value = true

            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'move'
            }
        }
    }

    function onDragLeave() {
        isDragOver.value = false
    }

    function onDragEnd() {
        isDragging.value = false
        isDragOver.value = false
        draggedType.value = null
        document.removeEventListener('drop', onDragEnd)
    }

    /**
     * Handles the drop event.
     *
     * @param {DragEvent} event
     */

    function onDrop(event, nodes, edges) {
        const position = screenToFlowCoordinate({
            x: event.clientX,
            y: event.clientY,
        })

        const nodeId = getId()
        let newNode
        if (nodes.find(node => node.type === 'model')) {
            model_id = nodes.find(node => node.type === 'model').id
        } else {
            model_id = null
        }
        if (draggedType.value === 'model') {
            if (model_id != null) {
                const modelNode = nodes.find(node => node.id === model_id);
                modelNode.data.label = nodeValue.name
                modelNode.data.info = nodeValue
                return
            }
            let flag = false
            nodes.forEach((node) => {
                if (node.type === 'node') {
                    flag = true

                }
            })
            if (flag === true) {
                newNode = {
                    id: nodeId,
                    type: draggedType.value,
                    position,
                    data: { label: nodeValue.name, info: nodeValue },

                    style: { backgroundColor: 'rgba(240, 248, 255, 0.9)', width: '200px', height: '200px', }
                }
                model_id = newNode.id
            } else {
                ElMessage({ type: 'warning', message: '请先选择节点' })
                return
            }
        }
        else if (draggedType.value === 'layer') {
            if (model_id === null) {
                ElMessage({ type: 'warning', message: '请先选择模型' })

                return
            }


            newNode = {
                id: nodeId,
                type: draggedType.value,
                position,
                data: { label: nodeValue.name, info: nodeValue },
                expandParent: true,
                parentNode: model_id,
            }
        } else if (draggedType.value === 'template') {
            let flag = false
            nodes.forEach((node) => {
                if (node.type === 'node') {
                    flag = true

                }
            })
            if (flag === false) {
                ElMessage({ type: 'warning', message: '请先选择节点' })
                return
            }
            console.log('template');
            let modelNode = {
                id: nodeId,
                type: 'model',
                position,
                data: { label: nodeValue.params.model.model_type, info: { type: 'model', name: nodeValue.params.model.model_type, params: nodeValue.params.model } },

                style: { backgroundColor: 'rgba(240, 248, 255, 0.9)', width: '500px', height: '500px' }
            }
            addNodes(modelNode)
            model_id = modelNode.id

            // 设置初始排列参数
            const layerWidth = 170; // 每列的宽度
            const layerHeight = 60; // 每个节点的高度
            const maxHeight = 450; // 列的最大高度
            let currentX = 10; // 开始 X 坐标
            let currentY = 30; // 开始 Y 坐标
            let pre = null
            // 遍历 layers，创建对应节点
            nodeValue.params.layers.forEach(layer => {
                // 如果当前列超出最大高度，换列
                if (currentY + layerHeight > position.y + maxHeight) {
                    currentY = 30; // 重置 Y 坐标
                    currentX += layerWidth + 20;    // 移动到新列的 X 坐标
                }

                // 创建 layer 节点
                const layerNode = {
                    id: getId(),
                    type: 'layer',
                    position: { x: currentX, y: currentY },
                    data: {
                        label: layer.type,
                        info: { type: 'layer', name: layer.type, ico: Document, params: layer }
                    },
                    expandParent: true,
                    parentNode: model_id,
                };
                if (pre != null) {
                    const edge = {
                        id: `e-${pre.id}-${layerNode.id}`, source: pre.id, target: layerNode.id, type: 'layerline',
                        labelBgPadding: [8, 4],
                        labelBgBorderRadius: 4,
                        labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
                        markerEnd: MarkerType.ArrowClosed,
                        sourcePosition: pre.position.top,
                    }
                    addEdges(edge)
                }

                // 添加节点
                addNodes(layerNode);
                pre = layerNode;
                // 更新当前 Y 坐标
                currentY += layerHeight + 5; // 节点高度 + 间隔
            });
            return
        }
        else if (model_id != null && draggedType.value === 'node') {
            console.log('polymer');
            let flag = false
            polymer_id = null
            nodes.forEach(node => {

                if (node.type === 'polymer') {
                    node.data = { label: nodeValue.name, info: nodeValue }
                    flag = true
                    polymer_id = node.id
                }

            })
            if (flag) return
            newNode = {
                id: nodeId,
                type: 'polymer',
                position,
                data: { label: nodeValue.name, info: nodeValue },
            }
            polymer_id = newNode.id

        }
        else if (draggedType.value === 'algorithm') {
            if (polymer_id === null) {
                ElMessage({ type: 'warning', message: `请先选择聚合节点` })
                return
            }
            if (polymer_id != null) {
                let flag = false

                nodes.forEach(node => {

                    if (node.type === 'algorithm') {
                        ElMessage({ type: 'success', message: `聚合算法替换:${node.data.info.name}--->${nodeValue.name}` })
                        node.data = { label: nodeValue.name, info: nodeValue }
                        flag = true
                    }


                })
                if (flag) return
                newNode = {
                    id: nodeId,
                    type: draggedType.value,
                    position,
                    data: { label: nodeValue.name, info: nodeValue },
                }
            } else {
                ElMessage({ type: 'warning', message: '请先选择聚合节点' })
            }
        }
        else {
            newNode = {
                id: nodeId,
                type: draggedType.value,
                position,
                data: { label: nodeValue.name, info: nodeValue },
            }
        }

        /**
         * Align node position after drop, so it's centered to the mouse
         *
         * We can hook into events even in a callback, and we can remove the event listener after it's been called.
         */
        const { off } = onNodesInitialized(() => {
            updateNode(nodeId, (node) => ({
                position: { x: node.position.x - node.dimensions.width / 2, y: node.position.y - node.dimensions.height / 2 },

            }))

            off()
        })
        console.log('nodeValue', nodeValue);
        // 将新节点添加到 nodes 数组中
        addNodes(newNode)
        console.log('nodes', nodes);
        /*   nodes.push(newNode); */
        /*  console.log(nodes); */
    }

    return {
        draggedType,
        isDragOver,
        isDragging,
        onDragStart,
        onDragLeave,
        onDragOver,
        onDrop,
    }
}
