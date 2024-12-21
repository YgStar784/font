<script setup>
import {
    Document,
    Menu as IconMenu,
    Location,
    Setting,
} from '@element-plus/icons-vue'
//import { useCategoryStore } from '@/stores/category'
import { onMounted, ref } from 'vue';
import { getMenuAPI } from '@/apis/menu';
import { isCollapse } from './isCollapse';
import { useCategoryStore } from '@/stores/category'
import { User, List, HelpFilled, Help } from '@element-plus/icons-vue'
//const cateStore = useCategoryStore()
const iconList = ref(['User', 'Document', 'Location', 'Setting', 'PieChart'])

/* const menuList = ref([])
const getMenu = async () => {
    const res = await getMenuAPI()
    menuList.value = res.data
    console.log(res)
}

onMounted(() => getMenu()) */

// const categoryStore = useCategoryStore()
</script>

<template>
    <div>
        <el-menu :class="{ 'menu-collapse': isCollapse }" active-text-color="#ffd04b" background-color="#2d3a4b"
            class="el-menu-vertical-demo" :default-active="$route.path" text-color="#fff" router unique-opened
            :collapse="isCollapse" y>
            <el-sub-menu index="/userinfo">
                <template #title>
                    <el-icon>
                        <User />
                    </el-icon>
                    <span>用户管理</span>
                </template>
                <el-menu-item index="/userinfo">
                    <el-icon>
                        <UserFilled />
                    </el-icon>
                    个人信息</el-menu-item>
                <el-menu-item index="/users">
                    <el-icon>
                        <List />
                    </el-icon>
                    用户列表</el-menu-item>
                <el-menu-item index="/taskinfo">
                    <el-icon>
                        <Ticket />
                    </el-icon>
                    任务信息</el-menu-item>
            </el-sub-menu>
            <!--  -->
            <!--                 <el-menu-item index="/datasourceupload">
                    <el-icon>
                        <EditPen />
                    </el-icon>数据源导入
                </el-menu-item> -->

            <!--                 <el-sub-menu index="/datasourceupload">
                    <template #title> <span>
                            <el-icon>
                                <EditPen />
                            </el-icon> 数据源导入
                        </span></template>
                    <el-menu-item index="/datasourceupload">匿踪查询</el-menu-item>
                    <el-menu-item index="/datasourceupload">联邦学习</el-menu-item>
                    <el-menu-item index="/datasourceupload">安全多方计算</el-menu-item>
                    <el-menu-item index="/datasourceupload">隐私求交</el-menu-item>

                </el-sub-menu> -->
            <!-- </el-menu-item> -->

            <!--                 <el-menu-item index="/datasourceinfo">
                    <el-icon>
                        <Histogram />
                    </el-icon>
                    数据源信息</el-menu-item> -->
            <!--                 <el-menu-item index="/datasourceinfoNZ">匿踪查询</el-menu-item>
                <el-menu-item index="/datasourceinfoLB">联邦学习</el-menu-item>
                <el-menu-item index="/datasourceinfoAQ">安全多方计算</el-menu-item>
                <el-menu-item index="/datasourceinfoYS">隐私求交</el-menu-item> -->
            <!-- <el-sub-menu index="/datasourceinfo">
                    <template #title> <span>
                            <el-icon>
                                <Histogram />
                            </el-icon>
                            数据源信息</span></template>
                                   <el-menu-item index="/datasourceinfoNZ">匿踪查询</el-menu-item>
                    <el-menu-item index="/datasourceinfoLB">联邦学习</el-menu-item>
                    <el-menu-item index="/datasourceinfoAQ">安全多方计算</el-menu-item>
                    <el-menu-item index="/datasourceinfoYS">隐私求交</el-menu-item> 
                </el-sub-menu> -->
            <!--             </el-sub-menu>
 -->
            <el-sub-menu index="/tasks" popper-append-to-body>
                <template #title>
                    <el-icon>
                        <Management />
                    </el-icon>
                    <span>任务管理</span>
                </template>


                <el-sub-menu index="/mpc">
                    <template #title> <el-icon>
                            <Crop />
                        </el-icon>
                        安全多方计算</template>
                    <el-menu-item index="/mpc/arithmetic" popper-append-to-body>
                        <el-icon>
                            <Help />
                        </el-icon>
                        四则运算</el-menu-item>
                    <el-menu-item index="/mpc/stealthquery" popper-append-to-body>
                        <el-icon>
                            <Search />
                        </el-icon>
                        匿踪查询</el-menu-item>
                    <el-menu-item index="/mpc/privateSetIntersection" popper-append-to-body>
                        <el-icon>
                            <Aim />
                        </el-icon>
                        隐私求交</el-menu-item>
                </el-sub-menu>
                <el-sub-menu index="/fl">
                    <template #title> <el-icon>
                            <Reading />
                        </el-icon>
                        联邦学习</template>

                    <el-menu-item index="/fl/federatedLearning" popper-append-to-body>
                        <el-icon>
                            <Coin />
                        </el-icon>
                        联邦建模</el-menu-item>
                    <el-menu-item index="/fl/flPredict" popper-append-to-body>
                        <el-icon>
                            <PieChart />
                        </el-icon>
                        联邦预测</el-menu-item>
                </el-sub-menu>




            </el-sub-menu>

        </el-menu>
    </div>
</template>
<style>
.el-menu--collapse {
    overflow: visible !important;
}

.el-menu--popup-container {
    z-index: 9999 !important;
    overflow: visible !important;
}
</style>
<style lang="scss">
.el-menu--popup-container .el-menu--popup {
    overflow: visible !important;
}

::v-deep.el-menu-vertical-demo {
    /* 控制菜单宽度 */
    width: auto;

    /* 修复折叠状态下的子菜单弹出显示 */
    &.el-menu--collapse {
        overflow: visible;
    }

    .el-submenu {
        overflow: visible;
    }

    .el-menu-item {
        overflow: visible;
    }

    /* 设置弹出菜单的z-index */
    .el-popper {
        z-index: 9999;
    }
}

/* 避免子菜单中的滚动条 */
.el-menu--popup-container {
    overflow: visible !important;
}

::v-deep.el-menu--vertical>.el-menu--popup {
    overflow-y: none !important;
    overflow-x: none;
}

/* 仅在折叠状态时移除 max-height 和 overflow */
.menu-collapse ::v-deep .el-menu--vertical>.el-menu--popup {
    max-height: none !important;
    overflow-y: visible !important;
}

/* .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
}

::v-deep.el-menu {
    width: auto;
    border-right: none;
    background-color: #2d3a4b;


    &.el-menu--collapse {
        width: auto;
    }
}

::v-deep.el-submenu:hover {
    color: white !important;
    background: #1890FF !important;
}

::v-deep.el-menu-item:hover {
    color: white !important;
    background: #1890FF !important;
}

.el-submenu__title:hover {
    background-color: rgb(3, 19, 33) !important;
}

//子级的类名

.el-menu-item:hover {

    background-color: rgb(3, 19, 33) !important;

}    */
</style>
