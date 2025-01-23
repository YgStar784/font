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
function toPascalCase(str) {
    return str
        .toLowerCase() // 全部转换为小写
        .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase()) // 每个单词首字母大写
        .replace(/^[a-z]/, (firstChar) => firstChar.toUpperCase()); // 确保第一个字符大写
}

// 示例
console.log(toPascalCase("hello world"));  // HelloWorld
console.log(toPascalCase("convert-to-pascal_case"));  // ConvertToPascalCase
console.log(toPascalCase("EXAMPLE_string-123"));  // ExampleString123
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

    const { addNodes, removeNodes, addEdges, screenToFlowCoordinate, onNodesInitialized, updateNode, updateEdge } = useVueFlow()

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
                    showHandles: false, // 控制 Handle 是否显示
                    style: { backgroundColor: 'rgba(246, 248, 250, 0.9)', width: '200px', height: '200px', }
                }
                model_id = newNode.id
            } else {
                ElMessage({ type: 'warning', message: '请先选择节点' })
                return
            }
        }
        else if (draggedType.value === 'layer') {
            if (model_id === null) {

                let modelNode = {
                    id: getId(),
                    type: 'model',
                    position,
                    showHandles: false, // 控制 Handle 是否显示
                    data: {
                        label: ' ', info: {
                            type: 'model', name: ' ', params: {

                                tag: 'mnist_cnn',
                                device: 'cuda',
                                model_type: 'fed_model',
                                task_type: 'multi_classification',
                                n_epochs: 1,
                                n_components: 1,
                                batch_size: 32,
                                optimizer: 'adam',
                                learning_rate: 0.001,
                                loss: 'ce',

                            }
                        }
                    },

                    style: { backgroundColor: 'rgba(246, 248, 250 ,0.7)', width: '70px', height: '70px', border: 'none', }
                }
                model_id = modelNode.id

                addNodes(modelNode)

                newNode = {
                    id: getId(),
                    type: draggedType.value,
                    position,
                    data: { label: nodeValue.name, info: nodeValue },
                    expandParent: true,
                    parentNode: model_id,
                }
            } else {
                // 获取所有 `layer` 类型的节点
                const existingLayers = nodes.filter(node => node.type === 'layer' && node.parentNode === model_id);

                // 如果已经存在 `layer` 节点，则计算其位置，找到最后一行/列的位置
                let currentX = 10;
                let currentY = 30;
                const layerWidth = 170;  // 每列的宽度
                const layerHeight = 60;  // 每个节点的高度
                const maxLayersPerColumn = 6;  // 每列最多 6 个节点

                if (existingLayers.length > 0) {
                    // 计算最后一个节点的 X 和 Y 位置
                    const lastLayer = existingLayers[existingLayers.length - 1];
                    const lastPosition = lastLayer.position;
                    const columnIndex = Math.floor(existingLayers.length / maxLayersPerColumn);
                    const rowIndex = existingLayers.length % maxLayersPerColumn;

                    currentX = 10 + columnIndex * (layerWidth + 20);
                    currentY = 30 + rowIndex * (layerHeight + 5);
                }
                newNode = {
                    id: getId(),
                    type: draggedType.value,
                    position: { x: currentX, y: currentY },
                    data: { label: nodeValue.name, info: nodeValue },
                    expandParent: true,
                    parentNode: model_id,
                }
            }


        } else if (draggedType.value === 'template') {
            // 找到所有 `layer` 和 `model` 类型的节点的 ID
            const nodeIdsToRemove = nodes
                .filter(node => node.type === 'layer' || node.type === 'model')
                .map(node => node.id)
            console.log('nodeIdsToRemove', nodeIdsToRemove);
            // 批量删除节点
            if (nodeIdsToRemove.length > 0) {
                console.log('nodeIdsToRemove');

                ElMessage({ type: 'success', message: `模版---${nodeValue.name}` })

                removeNodes(nodeIdsToRemove)
            }
            console.log('nodes', nodes);
            console.log('template');
            let modelNode = {
                id: nodeId,
                type: 'model',
                position,
                data: { label: ' ', info: { type: 'model', name: ' ', params: nodeValue.params.model } },
                showHandles: false, // 控制 Handle 是否显示
                style: { backgroundColor: 'rgba(246, 248, 250 ,0.7)', width: '100px', height: '100px', border: 'none', }
            }
            addNodes(modelNode)
            model_id = modelNode.id

            // 设置初始排列参数
            const layerWidth = 170; // 每列的宽度
            const layerHeight = 60; // 每个节点的高度
            const maxHeight = 190; // 列的最大高度
            let currentX = 10; // 开始 X 坐标
            let currentY = 30; // 开始 Y 坐标
            let pre = null
            let layerCount = 0
            // **统计布局信息**
            let maxColumns = 0; // 统计总列数
            let currentColumnLayers = 0; // 当前列的层数
            // 遍历 layers，创建对应节点
            nodeValue.params.layers.forEach(layer => {

                if (layerCount != 0 && layerCount % 6 === 0) {
                    currentY = 30; // 重置 Y 坐标
                    currentX += layerWidth + 20;    // 移动到新列的 X 坐标
                }

                // 创建 layer 节点
                const layerNode = {
                    id: getId(),
                    type: 'layer',
                    position: { x: currentX, y: currentY },
                    data: {
                        label: toPascalCase(layer.type),
                        info: { type: 'layer', name: toPascalCase(layer.type), ico: Document, params: layer }
                    },
                    expandParent: true,
                    parentNode: model_id,
                };
                /*                 if (pre != null) {
                
                                    addEdges([{
                                        id: `e-${pre.id}-${layerNode.id}`, source: pre.id, target: layerNode.id, type: 'smoothstep',
                                        labelBgPadding: [8, 4],
                                        labelBgBorderRadius: 4,
                                        animated: true,
                                        style: { stroke: '#10b981' },
                                        labelBgStyle: { strokeWidth: 3, fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
                                        markerEnd: MarkerType.ArrowClosed,
                                        sourcePosition: pre.position.top,
                                    }])
                
                                } */

                // 添加节点
                addNodes(layerNode);
                pre = layerNode;
                // 更新当前 Y 坐标
                currentY += layerHeight + 5; // 节点高度 + 间隔
                layerCount++;
            });


        }
        else if (draggedType.value === 'polymer') {
            console.log('polymer');
            let flag = false
            polymer_id = null
            nodes.forEach(node => {

                if (node.type === 'polymer') {
                    node.data = { label: nodeValue.name, info: nodeValue }
                    ElMessage({ type: 'success', message: `server节点---${nodeValue.name}` })
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
        }

        else {
            newNode = {
                id: getId(),
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

        // 将新节点添加到 nodes 数组中
        addNodes(newNode)
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
