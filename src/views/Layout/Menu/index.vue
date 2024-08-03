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
import { User, List, HelpFilled } from '@element-plus/icons-vue'
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
        <el-menu active-text-color="#ffd04b" background-color="#2d3a4b" class="el-menu-proper-demo"
            :default-active="$route.path" text-color="#fff" router unique-opened :collapse="!isCollapse">
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
            <el-sub-menu index="1">
                <template #title>
                    <el-icon>
                        <HelpFilled />
                    </el-icon>
                    <span>数据源</span>
                </template>
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
                <el-menu-item index="/datasourceinfoNZ">匿踪查询</el-menu-item>
                <el-menu-item index="/datasourceinfoLB">联邦学习</el-menu-item>
                <el-menu-item index="/datasourceinfoAQ">安全多方计算</el-menu-item>
                <el-menu-item index="/datasourceinfoYS">隐私求交</el-menu-item>
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
            </el-sub-menu>

            <el-sub-menu index="/tasks">
                <template #title>
                    <el-icon>
                        <Management />
                    </el-icon>
                    <span>任务管理</span>
                </template>
                <el-menu-item index="/stealthquery">
                    <el-icon>
                        <Search />
                    </el-icon>
                    匿踪查询</el-menu-item>
                <el-menu-item index="/federatedLearning">
                    <el-icon>
                        <Reading />
                    </el-icon>
                    联邦学习</el-menu-item>
                <el-menu-item index="/mpc">
                    <el-icon>
                        <Crop />
                    </el-icon>
                    安全多方计算</el-menu-item>
                <el-menu-item index="/privateSetIntersection">
                    <el-icon>
                        <Aim />
                    </el-icon>
                    隐私求交</el-menu-item>

            </el-sub-menu>

        </el-menu>
    </div>
</template>
<style lang="scss" scoped>
/* .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
} */

/* ::v-deep.el-menu {
    width: auto;
    border-right: none;
    background-color: #2d3a4b;


    &.el-menu--collapse {
        width: auto;
    }
}
 */
/* 
::v-deep.el-submenu:hover {
    color: white !important;
    background: #1890FF !important;
} */

/* ::v-deep.el-menu-item:hover {
    color: white !important;
    background: #1890FF !important;
}
 */
/* .el-submenu__title:hover {
    background-color: rgb(3, 19, 33) !important;
}

//子级的类名

.el-menu-item:hover {

    background-color: rgb(3, 19, 33) !important;

} */
</style>
