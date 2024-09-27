<template>
    <!-- 匿踪查询 -->
    <div>
        <el-row align="middle" class="grid-content">
            <el-col :span="24">

                匿踪查询
            </el-col>
        </el-row>
        <div>
            <el-row>
                <el-col :span="2">
                    <div style="padding-top: 5px;">
                        <el-text style="padding-left: 20px;">端口:

                        </el-text>
                    </div>
                </el-col>
                <el-col :span="2">
                    <el-input v-model="port" disabled />

                </el-col>
                <el-col :span="4">

                </el-col>
                <el-col :span="2">
                    <div style="padding-top: 5px;">
                        <el-text type="success" style="padding-left: 20px">已发布:
                        </el-text>
                    </div>
                </el-col>
            </el-row>
        </div>
    </div>
</template>
<script setup>
</script>


<style lang="scss" scoped>
.el-row {
    margin-bottom: 20px;
}

.el-row:last-child {
    margin-bottom: 0;
}

.el-col {
    border-radius: 4px;
}

.grid-content {
    display: flex;
    border-radius: 4px;
    min-height: 50px;
    background-color: #F0F2F5;
    padding-left: 15px;
    font-size: 16px;
    font-family: '微软雅黑';
}
</style>
