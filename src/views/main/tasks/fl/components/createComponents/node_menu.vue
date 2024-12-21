<template>
    <div class="flow-menu" ref="tool">
        <div v-for="menu in menuList" :key="menu.id">
            <span class="ef-node-pmenu" @click="menu.open = !menu.open">
                <el-icon>
                    <component :is="menu.open ? CaretBottom : CaretRight"></component>
                </el-icon>
                &nbsp;{{
                    menu.name }}
            </span>
            <ul v-show="menu.open" class="ef-node-menu-ul">
                <ul v-show="menu.open" class="ef-node-menu-ul">
                    <draggable v-model="menu.children" @start="move" @end="end">
                        <template #item="{ element, index }">
                            <li class="ef-node-menu-li" v-if="index < menu.visibleChildrenCount" :key="element.id"
                                :draggable="true" :type="element.type" @dragstart="onDragStart($event, element)">
                                <el-icon>
                                    <component :is="element.ico"></component>
                                </el-icon>
                                {{ element.name }}
                            </li>
                        </template>
                    </draggable>
                    <li v-if="menu.children.length > menu.visibleChildrenCount" class="ef-node-menu-li"
                        @click="loadMore(menu)">
                        <el-icon>
                            <MoreFilled />
                        </el-icon>
                    </li>
                    <li v-if="menu.total && menu.total > menu.visibleChildrenCount" class="ef-node-menu-li"
                        @click="loadMore(menu)">
                        <el-icon>
                            <MoreFilled />
                        </el-icon>
                    </li>
                </ul>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import draggable from 'vuedraggable'
import { MoreFilled, Location, Coin, VideoPause, VideoPlay, CaretBottom, CaretRight, Download, Document, Refresh } from '@element-plus/icons-vue';
import useDragAndDrop from '@/utils/useDnD'
import { menu } from '../menu.js'
import axios from 'axios'
const { onDragStart } = useDragAndDrop()
const userTotal = ref(0)
const menuList = ref(menu);
const currentUsersList = ref([])
const nodeMenu = ref({});
const nodeClickCuont = ref(0)
const move = (evt) => {
    const type = evt.item.attributes.type.nodeValue;
    nodeMenu.value = getMenuByType(type);
};
const queryFormUsers = ref({
    queryName: '',
    page: 1,
    pageSize: 5 + 5 * nodeClickCuont.value,
})
const end = (evt) => {
    console.log('Node drag ended', evt);
};
// Function to load more children in increments of 5

const loadMore = async (menu) => {
    nodeClickCuont.value = nodeClickCuont.value + 1;
    if (menu.type === 'node') {
        getUsers()
    }
    menu.visibleChildrenCount += 5;
};
const getMenuByType = (type) => {
    for (let i = 0; i < menuList.value.length; i++) {
        const children = menuList.value[i].children;
        for (let j = 0; j < children.length; j++) {
            if (children[j].type === type) {
                return children[j];
            }
        }
    }
};
const getUsers = async () => {
    await axios.post('/api/getAllUserPublic', queryFormUsers.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            // console.log(res)
            if (res.data.code === 1000) {
                currentUsersList.value = res.data.data.userList
                // console.log(currentUsersList.value);
                userTotal.value = res.data.data.total
                let id = 1
                menu.value[0].children = []

                currentUsersList.value.forEach(user => {
                    const node = {
                        id: '1' + id,
                        type: 'node',
                        name: user.username,
                        ico: Location,
                        dataDescription: '',
                        params: {
                            cpu_capacity: 1,
                            memory_capacity: 1,
                            storage_capacity: 1,
                            net_throughput: 10,
                            state: 'success',
                            address: user.nodeIp + ':' + user.nodePort
                        }
                    }
                    menu.value[0].children.push(node)
                    id++
                })
                menu.value[0].total = userTotal.value
            }
            else {
                const msg = res.message
                ElMessage({
                    type: 'error',
                    message: msg,
                })
            }
        })


}

onMounted(async () => {
    await getUsers()
    console.log('currentUsersList.value', currentUsersList.value);
})
</script>

<style lang="scss" scoped>
.ef-node-pmenu {
    cursor: pointer;
    height: 32px;
    line-height: 32px;
    width: 100%;
    display: block;
    font-weight: bold;
    color: #4a4a4a;
    padding-left: 5px;
    text-align: left;
    border: none;
    box-sizing: border-box;
}

.ef-node-pmenu:hover {
    background-color: #e0e0e0;
}

.ef-node-menu-li {
    border-radius: 5px;
    width: 80%;
    padding: 10px;
    margin-top: 5px;
    margin-bottom: 5px;
    font-size: 14px;
    line-height: 20px;
    height: auto;
    border: 1px solid #d3d3d3;
    text-align: left;
}

.ef-node-menu-li:hover {
    cursor: move;
    background-color: #f0f7ff;
    border: 1px dashed #1879ff;
    border-left: 4px solid #1879ff;
    padding-left: 5px;
}

.ef-node-menu-ul {
    list-style: none;
    padding-left: 20px;
}
</style>