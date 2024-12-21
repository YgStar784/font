<template>
    <!--     <el-row>
      
        <el-col :span="24">
            <div class="ef-tooltar">
                <el-link type="primary" :underline="false">流程A</el-link>
                <el-divider direction="vertical"></el-divider>
                <el-button type="text" :icon="Delete" size="large" @click="deleteElement"></el-button>
                <el-divider direction="vertical"></el-divider>
                <el-button type="text" :icon="Download" size="large" @click="downloadData"></el-button>
                <el-divider direction="vertical"></el-divider>
                <el-button type="text" :icon="Plus" size="large" @click="zoomAdd"></el-button>
                <el-divider direction="vertical"></el-divider>
                <el-button type="text" :icon="Minus" size="large" @click=""></el-button>
                <div style="float: right; margin-right: 5px;">
                    <el-button type="info" plain round :icon="Document" @click="dataInfo" size="mini">流程信息</el-button>
                    <el-button type="primary" plain round @click="dataReloadA" :icon="Refresh"
                        size="mini">切换流程A</el-button>
                    <el-button type="primary" plain round @click="dataReloadB" :icon="Refresh"
                        size="mini">切换流程B</el-button>
                    <el-button type="primary" plain round @click="dataReloadC" :icon="Refresh"
                        size="mini">切换流程C</el-button>
                    <el-button type="primary" plain round @click="dataReloadD" :icon="Refresh"
                        size="mini">自定义样式</el-button>
                    <el-button type="primary" plain round @click="dataReloadE" :icon="Refresh"
                        size="mini">力导图</el-button>
                    <el-button type="info" plain round :icon="Document" @click="openHelp" size="mini">帮助</el-button>
                </div>
            </div>
        </el-col>
    </el-row> -->

    <div class="app">
        <!-- 左侧边栏 -->
        <div class="left-sidebar">
            <NodeMenu></NodeMenu>
        </div>

        <!-- 中间流程图容器 -->
        <div class="flow-container" @drop="onDrop($event, nodes, edges)">
            <VueFlow ref="flowRef" @nodes-change="onNodesChange" @edges-change="onEdgesChange" :apply-default="false"
                @nodesDelete="handleNodesDelete" class="vue-flow" :edges="edges" :nodes="nodes" :node-types="nodeTypes"
                @dragover="onDragOver" @dragleave="onDragLeave" fit-view-on-init elevate-edges-on-select>

                <MiniMap />
                <template #node-node="nodeProps">
                    <Node v-bind="nodeProps" />
                </template>
                <template #node-layer="nodeProps">
                    <Node v-bind="nodeProps" />
                </template>
                <template #node-algorithm="nodeProps">
                    <Node v-bind="nodeProps" />
                </template>
                <template #node-polymer="nodeProps">
                    <Node v-bind="nodeProps" />
                </template>
                <template #edge-buttonline="buttonEdgeProps">
                    <EdgeWithButton :id="buttonEdgeProps.id" :label="buttonEdgeProps.label"
                        :source-x="buttonEdgeProps.sourceX" :source-y="buttonEdgeProps.sourceY"
                        :target-x="buttonEdgeProps.targetX" :target-y="buttonEdgeProps.targetY"
                        :source-position="buttonEdgeProps.sourcePosition"
                        :target-position="buttonEdgeProps.targetPosition" :marker-end="buttonEdgeProps.markerEnd"
                        :style="buttonEdgeProps.style" />
                </template>
                <template #edge-special="specialEdgeProps">
                    <SpecialEdge v-bind="specialEdgeProps" />
                </template>

                <div class="top-op-bar">

                    <el-button v-if="!moreButShow" @click="handleMoreBut" circle><el-icon>
                            <More />
                        </el-icon></el-button>

                    <el-button v-if="moreButShow" @click="handleMoreBut" circle><el-icon>
                            <Close />
                        </el-icon></el-button>
                    <a-tooltip v-if="moreButShow" title="查看代码">
                        <a-button shape="circle" :icon="h(SearchOutlined)" />
                    </a-tooltip>
                </div>
                <Controls>
                    <!-- Default controls -->
                    <ControlButton title="Toggle Dark Mode" @click="toggleDarkMode">
                        <Icon v-if="dark" name="sun" />
                        <Icon v-else name="moon" />
                    </ControlButton>
                </Controls>
                <a-float-button v-if="canSubmit" class="submit" tooltip="提交" @click="showTaskInfoDialog"
                    type="primary"></a-float-button>
                <DropzoneBackground class="flow-background" :style="{
                    backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
                    transition: 'background-color 0.2s ease',
                }"></DropzoneBackground>
            </VueFlow>
        </div>

        <!-- 右侧边栏 -->
        <div class="right-sidebar" :style="{ width: rightSidebarWidth }">

            <el-button v-if="extendRightForm" class="openOrscale" @click="extendRightForm = !extendRightForm"
                circle><el-icon>
                    <ArrowRight />
                </el-icon> </el-button>
            <el-button v-else class="openOrscale" circle @click="extendRightForm = !extendRightForm"> <el-icon>
                    <ArrowLeft />
                </el-icon> </el-button>
            <TaskForm v-if="!selectedComponenet" :taskInfo="taskInfo" @updateTaskInfo="updateTaskInfo"></TaskForm>
            <NodeForm
                v-else-if="selectedComponenet && (selectedComponenet.type === 'starter' || selectedComponenet.type === 'node' || selectedComponenet.type === 'polymer')"
                :nodeInfo="selectedComponenet.data.info" @updateNodeInfo="updateNodeInfo"></NodeForm>
            <ModelForm v-else-if="selectedComponenet && selectedComponenet.type === 'model'"
                :modelInfo="selectedComponenet.data.info" @updateModelInfo="updateModelInfo"></ModelForm>
            <LayerForm v-else-if="selectedComponenet && selectedComponenet.type === 'layer'"
                :layerInfo="selectedComponenet.data.info" @updateLayerInfo="updateLayerInfo"></LayerForm>
            <CustomForm v-else-if="selectedComponenet && selectedComponenet.type === 'custom'"
                :customInfo="selectedComponenet" :key="selectedComponenet.id">
            </CustomForm>
            <AlgForm v-else-if="selectedComponenet && selectedComponenet.type === 'algorithm'"
                @updateAlgInfo="updateAlgInfo" :algInfo="selectedComponenet.data.info">
            </AlgForm>
            <TaskInfoShowDialog v-model="taskInfoShow" :nodesInfo="sendForm"></TaskInfoShowDialog>
        </div>
    </div>
</template>
<script setup>
import { ref, watch, computed, h, onMounted, reactive } from 'vue'
import { VueFlow, useVueFlow, MarkerType } from '@vue-flow/core'
import { SearchOutlined } from '@ant-design/icons-vue';

import { message } from 'ant-design-vue';
import CustomNode from './components/createComponents/CustomNode.vue';
import CustomEdge from './components/createComponents/CustomEdge.vue';
import Node from './components/createComponents/node.vue'
import SpecialEdge from './components/createComponents/SpecialEdge.vue'
import { Delete, Download, Plus, Minus, Refresh, Document } from '@element-plus/icons-vue'
import NodeMenu from './components/createComponents/node_menu.vue'
import nodeForm from './components/createComponents/formComponents/node_form.vue'
import useDragAndDrop from '@/utils/useDnD'
import DropzoneBackground from './components/createComponents/DropzoneBackground.vue'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import EdgeWithButton from './components/createComponents/EdgeWithButton.vue'
import RightForm from './components/createComponents/formComponents/node_form.vue'
import { larger, log } from 'mathjs';
import dagre from 'dagre';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import SomeTools from '@/utils/someTools'
import { nowDate } from '../date'

import TaskForm from './components/createComponents/formComponents/task_form.vue'
import NodeForm from './components/createComponents/formComponents/node_form.vue'
import ModelForm from './components/createComponents/formComponents/model_form.vue'
import LayerForm from './components/createComponents/formComponents/layer_form.vue';
import AlgForm from './components/createComponents/formComponents/algorithm_form.vue'
import CustomForm from './components/createComponents/formComponents/custom_form.vue';
import { extendRightForm } from './components/createComponents/rightBarExtend.js'
import TaskInfoShowDialog from './components/createComponents/taskInfoShowDialog.vue'
const { onConnect, nodes, edges, setNodes, addNodes, addEdges, getNodes, getSelectedNodes,
    getSelectedEdges, onNodeClick, removeNodes, removeEdges, applyEdgeChanges, onEdgeClick, applyNodeChanges, onPaneClick, removeSelectedElements, removeSelectedNodes } =
    useVueFlow({ id: 'flowRef' })
// Register the custom node
const nodeTypes = {
    'node-node': Node,
    'node-layer': Node,
    'node-algorithm': Node,
    'node-polymer': Node,
}
const nodesInfo = ref(null)
const dark = ref(false)
const canSubmit = ref(false)
const currentNodesList = ref([])
const currentlayersList = ref([])
const flowRef = ref(null); // 绑定 <vue-flow> 的 ref
const [messageApi, contextHolder] = message.useMessage();
const moreButShow = ref(false)
const selectedComponenet = ref(null)
const buttonEdgeProps = {
    'edge-buttonline': EdgeWithButton,
}
const starterInfo = ref({})
//用户点击提交之后，显示任务信息对话框
const taskInfoShow = ref(false)
const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop()
const userStore = useUserStore()
var getTime = new Date().getTime(); //获取到当前时间戳
var time = new Date(getTime); //创建一个日期对象
const taskInfo = ref({
    name: '',
    taskUuid: SomeTools.guid(),
    n_rounds: 1,
    taskDescription: '',
})
const sendForm = reactive({});
// 动态样式：根据 isWide 的值调整宽度
const rightSidebarWidth = computed(() => (extendRightForm.value ? '80%' : '20%'));

const showTaskInfoDialog = () => {
    // 清空 sendForm 的内容
    Object.assign(sendForm, {});
    const taskParams = ref({})
    sendForm.taskName = taskInfo.value.name
    sendForm.taskUuid = taskInfo.value.taskUuid
    sendForm.createTime = nowDate(time)
    sendForm.taskDescription = taskInfo.value.taskDescription
    taskParams.value.name = sendForm.taskName
    taskParams.value.taskId = sendForm.taskUuid

    console.log(nodes.value);
    //获取聚合节点信息
    const polymer = nodes.value.filter(node => node.type === 'polymer')
    taskParams.value.serverNode = {
        address: polymer[0].data.info.params.address,
        uuid: SomeTools.guid(),
        dataDescription: polymer[0].data.info.dataDescription
    }
    //获取训练节点信息clientNodes
    taskParams.value.clientNodes = []

    const trainers = nodes.value.filter(node => node.type === 'node')
    console.log('trainers', trainers);
    trainers.forEach(trainer => {
        taskParams.value.clientNodes.push({
            address: trainer.data.info.params.address,
            uuid: SomeTools.guid(),
            dataDescription: trainer.data.info.dataDescription
        })
    })
    //获取训练轮数nRounds
    taskParams.value.nRounds = taskInfo.value.n_rounds
    //获取聚合算法code
    const alg = nodes.value.filter(node => node.type === 'algorithm')
    taskParams.value.alg = alg[0].data.info.params.code
    //saveMode目前写死
    taskParams.value.saveMode = 0
    //获取模型信息
    const modelConfig = ref({})
    const model = nodes.value.filter(node => node.type === 'model')
    modelConfig.value = model[0].data.info.params
    modelConfig.value.layers = []
    const layers = nodes.value.filter(node => node.type === 'layer')
    layers.forEach(layer => {
        modelConfig.value.layers.push(layer.data.info.params)
    })
    taskParams.value.modelConfig = modelConfig.value
    sendForm.taskParams = taskParams.value
    console.log('sendForm', sendForm);
    // 等待数据完成响应式更新后再打开对话框

    taskInfoShow.value = true;

}
/* const nodes = ref([

{ id: '1', position: { x: 100, y: 100 }, data: { label: '发起方' }, type: 'starter' },
]) */

onConnect(addEdges)

// 定义边
/* const edges = ref([
]) */
// Track mouse position
let mousePosition = { x: 0, y: 0 }
// Create a computed property for nodes' length
onNodeClick((event, node) => {
    console.log('envet', event.node);
    selectedComponenet.value = event.node;
    console.log('selectedComponenet', selectedComponenet.value);
});
const handleNodesChange = () => {
    console.log('handleNodesChange');
}
onPaneClick(() => {
    selectedComponenet.value = null;
    console.log('selectedComponenet', selectedComponenet.value);

})
const getUserInfo = async () => {
    console.log(localStorage.getItem('token'))
    const res = await userStore.getUserInfo()
    console.log(userStore.userInfo)
    starterInfo.value = userStore.userInfo
    console.log('starterInfo.value', starterInfo.value);
    starterInfo.value.level = localStorage.getItem('level') === '0' ? '管理员' : '普通用户'

}
const findSelected = () => {
    if (!onNodeClick()) {
        selectedComponenet.value = null
    }
    console.log('selectedComponenet', selectedComponenet.value);

}
const handleNodesDelete = (event) => {
    console.log('delete');


}


const onNodesChange = async (changes) => {
    const nextChanges = [];
    const nodeTypesOrder = ['starter', 'node', 'model', 'polymer', 'algorithm', 'ender']; // 定义节点顺序

    for (const change of changes) {
        if (change.type === 'remove') {
            selectedComponenet.value = null

            // 获取删除后剩下的节点（假设删除选中的节点）
            const selectedNodes = nodes.value.filter(node => node.selected); // 当前被选中的节点



            // 提取剩余节点的类型顺序
            // 提取剩余节点类型
            // 提取剩余节点类型
            const remainingTypes = nodes.value
                .filter(node =>
                    !selectedNodes.some(selectedNode => selectedNode.id === node.id) // 剔除被选中的节点
                )
                .reduce((uniqueTypes, node) => {
                    if (node.type === 'layer') {
                        return uniqueTypes; // 忽略 layer 类型
                    }
                    // 如果是 node 类型，确保只提取一次
                    if (node.type === 'node' && !uniqueTypes.includes('node')) {
                        uniqueTypes.push('node');
                    } else if (node.type !== 'node') {
                        uniqueTypes.push(node.type);
                    }
                    return uniqueTypes;
                }, []);

            let length = 0; // 用于记录匹配的顺序长度
            for (const type of nodeTypesOrder) {
                if (remainingTypes.includes(type)) {
                    length++;
                } else {
                    break;
                }
            }

            // 校验剩余类型是否符合顺序
            if (length !== remainingTypes.length) {
                // 显示警告信息并取消删除操作
                ElMessage({ type: 'warning', message: '只能逆序删除！' })
                return;
            }

            nextChanges.push(change);
        } else {
            nextChanges.push(change);
        }
    }

    // 应用变化
    applyNodeChanges(nextChanges);


};
const onEdgesChange = (changes) => {
    const nextChanges = [];

    console.log('onEdgesChange', changes);

    for (const change of changes) {
        if (change.type === 'remove' || change.type === 'add') {
            console.warn(`Edge ${change.id} cannot be removed.`);
            // 跳过删除操作
            continue;
        }
        else {
            nextChanges.push(change);
        }
    }

    // 只应用非删除类型的更改
    applyEdgeChanges(nextChanges);
};
function arrangeChildNodesVertically(parentNode, childNodes) {
    // 子元素的宽度和高度
    const CHILD_WIDTH = 160;
    const CHILD_HEIGHT = 36;

    // 设置垂直间距
    const VERTICAL_SPACING = 10;

    // 起始 y 坐标，假设子元素从父节点的顶部开始排列
    let currentY = VERTICAL_SPACING;

    // 遍历每个子节点并设置它们的位置
    const updatedChildNodes = childNodes.map((childNode, index) => {
        return {
            ...childNode,
            position: {
                x: (parentNode.style.width - CHILD_WIDTH) / 2, // 水平居中对齐父节点
                y: currentY,
            },
        };
        // 更新 y 坐标，为下一个子节点留出位置
        currentY += CHILD_HEIGHT + VERTICAL_SPACING;
    });

    return updatedChildNodes;
}
const applyDagreLayout = () => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 100 }); // 配置布局方向和节点间隔
    g.setDefaultEdgeLabel(() => ({}));

    // 将 Vue Flow 节点添加到 dagre 图中
    nodes.value.forEach((node) => {
        g.setNode(node.id, { width: 100, height: 50 }); // 设置节点的宽度和高度
    });

    // 将 Vue Flow 边添加到 dagre 图中
    edges.value.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
    });

    // 执行布局计算
    dagre.layout(g);

    // 更新 Vue Flow 中的节点位置
    const layoutedNodes = nodes.value.map((node) => {
        const layoutedNode = g.node(node.id);
        return {
            ...node,
            position: { x: layoutedNode.x, y: layoutedNode.y },
        };
    });

    setNodes(layoutedNodes); // 应用布局后的节点位置
}

// 删除父节点时递归删除其子节点
const deleteNodeWithChildren = (nodeId) => {
    // 找到所有的子节点（即 parentNode 为当前节点的节点）
    const childNodes = nodes.value.filter(node => node.parentNode === nodeId);

    // 递归删除每个子节点
    childNodes.forEach(childNode => deleteNodeWithChildren(childNode.id));

    // 删除与当前节点关联的边
    edges.value = edges.value.filter(edge => edge.source !== nodeId && edge.target !== nodeId);

    // 删除当前节点
    nodes.value = nodes.value.filter(node => node.id !== nodeId);
};
// Create a computed property for nodes' length
const nodesLength = computed(() => nodes.value.length);
function toggleDarkMode() {
    dark.value = !dark.value
}

const handleMoreBut = () => {
    moreButShow.value = !moreButShow.value
}
// Watch the length of nodes
watch(nodesLength, (newLength, oldLength) => {
    console.log('New length:', newLength, 'Old length:', oldLength);
    if (newLength === oldLength + 1) {
        const node = nodes.value[newLength - 1]; // Get the newly added node
        console.log(node);
        const type = node.type
        if (type === 'node') {
            currentNodesList.value.push(node)
            nodes.value.forEach((item) => {
                if (item.type === 'starter') {
                    const edge = {
                        id: `e-${item.id}-${node.id}`, source: item.id, target: node.id, label: '发起任务', type:
                            'buttonline', labelBgPadding: [8, 4],
                        labelBgBorderRadius: 4,
                        labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
                        markerEnd: MarkerType.ArrowClosed,

                    }
                    edges.value.push(edge);
                }
            })
        }
        if (type === 'model') {
            nodes.value.forEach((item) => {
                if (item.type === 'node') {
                    const edge = {
                        id: `e-${item.id}-${node.id}`, source: item.id, target: node.id, label: '本地训练', type:
                            'buttonline', labelBgPadding: [8, 4],
                        labelBgBorderRadius: 4,
                        labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
                        markerEnd: MarkerType.ArrowClosed,

                    }
                    edges.value.push(edge)
                }
            })
        }
        if (type === 'layer') {
            currentlayersList.value.push(node)
            const pre = nodes.value[nodes.value.length - 2]
            if (pre.type === 'model') {
                return
            }
            const edge = {
                id: `e-${pre.id}-${node.id}`, source: pre.id, target: node.id, type: 'layerline',
                labelBgPadding: [8, 4],
                labelBgBorderRadius: 4,
                labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
                markerEnd: MarkerType.ArrowClosed,
                sourcePosition: pre.position.top,
            }
            edges.value.push(edge);
        }
        if (type === 'polymer') {
            nodes.value.forEach((item) => {
                if (item.type === 'model') {
                    const edge = {
                        id: `e-${item.id}-${node.id}`, source: item.id, target: node.id, label: '聚合', type:
                            'buttonline', labelBgPadding: [8, 4],
                        labelBgBorderRadius: 4,
                        labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
                        markerEnd: MarkerType.ArrowClosed,
                        sourcePosition: item.position.bottom,

                    }
                    edges.value.push(edge);

                }
            })
        }
        if (type === 'algorithm') {
            nodes.value.forEach((item) => {
                if (item.type === 'polymer') {
                    const edge = {
                        id: `e-${item.id}-${node.id}`, source: item.id, target: node.id, type: 'ployline',
                        labelBgPadding: [8, 4],
                        labelBgBorderRadius: 4,
                        labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
                        markerEnd: MarkerType.ArrowClosed,
                        sourcePosition: item.position.bottom,
                    }
                    edges.value.push(edge);

                }
            })
            let ender = {
                id: 'ender', position: { x: node.position.x - 80, y: node.position.y + 50 }, data: { label: '接收方' }, type:
                    'ender'
            }
            addNodes([ender
            ])
            edges.value.push({
                id: `e-${node.id}-${ender.id}`, source: node.id, target: ender.id, type: 'ployline',
                labelBgPadding: [8, 4],
                labelBgBorderRadius: 4,
                labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
                markerEnd: MarkerType.ArrowClosed,
                sourcePosition: node.position.bottom,
            })
        }
    } else if (newLength > oldLength + 1) {
        let pre = null
        nodes.value.forEach((node, index) => {
            if (node.type === 'model') {
                nodes.value.forEach((item) => {
                    if (item.type === 'node') {
                        const edge = {
                            id: `e-${item.id}-${node.id}`, source: item.id, target: node.id, label: '本地训练', type:
                                'buttonline', labelBgPadding: [8, 4],
                            labelBgBorderRadius: 4,
                            labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
                            markerEnd: MarkerType.ArrowClosed,

                        }
                        edges.value.push(edge)
                    }
                })
            }
            if (node.type === 'layer') {
                if (pre != null) {
                    const isSameColumn = pre.position.x === node.position.x; // 判断是否在同一列

                    const edge = {
                        id: `e-${pre.id}-${node.id}`,
                        source: pre.id,
                        target: node.id,
                        type: 'smoothstep', // 使用平滑曲线
                        labelBgPadding: [8, 4],
                        labelBgBorderRadius: 4,
                        labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
                        markerEnd: MarkerType.ArrowClosed,
                        sourceHandle: isSameColumn ? 'b' : 'r',
                        targetHandle: isSameColumn ? 't' : 'l',
                    };

                    edges.value.push(edge);
                }
                pre = node
            }
        })
    } else if (newLength < oldLength) {
        const ModelNodeExists = nodes.value.some(node => node.type === 'model');
        if (!ModelNodeExists) {
            // 找到所有 type === 'layer' 的节点
            const layerNodes = nodes.value.filter(node => node.type === 'layer');

            // 从 nodes 中移除这些节点
            nodes.value = nodes.value.filter(node => node.type !== 'layer');

            // 还需要从 edges 中移除与这些节点相关的边
            const layerNodeIds = layerNodes.map(node => node.id);
            edges.value = edges.value.filter(
                edge => !layerNodeIds.includes(edge.source) && !layerNodeIds.includes(edge.target)
            );

            console.log('Removed layer nodes:', layerNodes);
        }
    }


});
watch(nodes, () => {
    canSubmit.value = nodes.value.some(node => node.type === 'ender');

}, { deep: true })

//右侧任务基本信息的保存
const updateTaskInfo = (newTaskInfo) => {
    console.log('newTaskInfo', newTaskInfo);
    // 子组件传递的 `newFormula` 被接收
    taskInfo.value = newTaskInfo;
    console.log('Updated taskInfo:', newTaskInfo);
    message.success('saved')
};
const updateNodeInfo = (newNodeInfo) => {
    nodes.value.forEach(node => {
        if (node.id === selectedComponenet.value.id) {
            node.data.info = newNodeInfo
            console.log('Updated node ico:', node.data.info.ico);
        }
    })
    message.success('saved')
}
const updateModelInfo = (newModelInfo) => {
    // 子组件传递的 `newFormula` 被接收

    console.log('Updated newModelInfo:', newModelInfo);
    nodes.value.forEach(node => {
        if (node === selectedComponenet.value) {
            node.data.info = newModelInfo
        }
    })
    message.success('saved')
};

const updateLayerInfo = (newLayerInfo) => {
    // 子组件传递的 `newFormula` 被接收

    console.log('Updated newLayerInfo:', newLayerInfo);
    nodes.value.forEach(node => {
        if (node.id === selectedComponenet.value.id) {
            node.data.info = newLayerInfo
            console.log('Updated node ico:', node.data.info.ico);
        }
    })
    message.success('saved')
};

const updateAlgInfo = (newAlgInfo) => {
    // 子组件传递的 `newFormula` 被接收

    console.log('Updated newAlgInfo:', newAlgInfo);
    nodes.value.forEach(node => {
        if (node.id === selectedComponenet.value.id) {
            node.data.info = newAlgInfo
        }
    })
    message.success('saved')
};


onMounted(async () => {
    canSubmit.value = false
    await getUserInfo()
    addNodes([{
        id: 'starter',
        type: 'starter',
        position: { x: 100, y: 100 },
        data: {
            label: `发起方-${starterInfo.value.username}`
            , info: { params: { cpu_capacity: 1, memory_capacity: 1, storage_capacity: 1, net_throughput: 10, state: 'success', address: starterInfo.value.nodeIp + ':' + starterInfo.value.nodePort }, type: 'starter' }
            , type:
                'starter'
        }
    }])
})

</script>

<style lang="scss">
/* 确保 Vue Flow 样式生效 */
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
@import '@vue-flow/minimap/dist/style.css';
</style>
<style lang="scss" scoped>
html,
body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.app {
    display: flex;
    width: 100%;
    height: 100%;
}

.left-sidebar,
.right-sidebar {
    position: relative;
    width: 20%;



}

.openOrscale {
    position: absolute;
    left: -15px;
    /* 与父元素左边框对齐 */
    top: 50%;
    /* 垂直方向定位到父元素中间 */
    transform: translateY(-50%);
    /* 通过 transform 将子元素向上移动自身高度的一半 */
    z-index: 10;
}

.submit {
    position: absolute;
    bottom: 180px;
    right: 20px;
    transition: all 0.3s linear;
}

.left-sidebar {
    width: 17%;
    background-color: white;
    box-sizing: border-box;
    border-right: 1px solid gray;
    overflow-Y: auto;
}

.right-sidebar {
    display: flex;
    flex-direction: column;
    /* 水平居中 */
    box-sizing: border-box;
    align-items: flex-start;
    /* 垂直方向对齐顶部 */
    height: 100%;
    /* 确保侧边栏占满高度 */

    gap: 5px;
    /* 可以根据需要增加内边距 */
    border-left: 1px gray solid;
    /* 使 padding 不影响布局 */
    transition: width 0.3s ease;
    /* 添加平滑过渡 */
    z-index: 10;
}

.flow-container {
    width: 63%;
    height: 100%;
    position: relative;
}



.vue-flow {
    position: relative;
    height: 100%;
}

/*顶部工具栏*/
.ef-tooltar {
    padding-left: 10px;
    box-sizing: border-box;
    height: 42px;
    line-height: 42px;
    z-index: 3;
    border-bottom: 1px solid #DADCE0;
}

.flow-background {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    position: absolute;

}


/* 选中的箭头样式 */
.edge.selected marker {
    fill: #409EFF !important;
    /* 选中时的箭头颜色 */
}

.more-but {
    position: absolute;
    /* 设置为绝对定位 */
    top: 10px;
    /* 距离顶部 10px */
    right: 10px;
    /* 距离左侧 10px */
    z-index: 10;
    /* 确保在画布之上 */
    transition: all 0.3 ease;
}

.top-op-bar {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: row-reverse;
    gap: 5px;
    z-index: 10;
}
</style>
