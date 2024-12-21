<template>
    <div :class="['special-node', props.data.info.params?.state || 'default', { selected: props.selected }]">
        <div :key="props.data.info.ico">
            <el-icon style="padding-left: 10px; font-size: 25px;">
                <component :is="props.data.info.ico"></component>
            </el-icon>
        </div>
        <span class="label">
            <span class="ks" v-if="props.data.info.params.kernel_size">{{
                props.data.info.params.kernel_size
            }}X{{
                    props.data.info.params.kernel_size }}</span>
            {{ props.data.label }}</span>
        <span class="status" v-if="props.data.info.params?.state">
            <img v-if="props.data.info.params.state === 'success'"
                src="https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*6l60T6h8TTQAAAAAAAAAAAAAARQnAQ"
                alt="success" />
            <img v-if="props.data.info.params.state === 'failed'"
                src="https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*SEISQ6My-HoAAAAAAAAAAAAAARQnAQ"
                alt="failed" />
            <img v-if="props.data.info.params.state === 'running'"
                src="https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*t8fURKfgSOgAAAAAAAAAAAAAARQnAQ"
                alt="running" />
        </span>
    </div>
    <!-- Connection Handles using VueFlow's Handle component -->
    <Handle type="target" position="top" id="t" style="opacity: 0;" />
    <Handle type="source" position="bottom" id="b" style="opacity: 0;" />
    <Handle type="source" position="right" id="r" style="opacity: 0;" />
    <Handle type="target" position="left" id="l" style="opacity: 0;" />

</template>
<script setup>
import { Handle } from '@vue-flow/core'

const props = defineProps({
    id: String,
    position: Object,
    data: Object,
    selected: Boolean,
});
const getStatusImage = (status) => {
    const images = {
        default: 'path-to-default-image',
        success: 'path-to-success-image',
        failed: 'path-to-failed-image',
        running: 'path-to-running-image',
    };
    return images[status] || images.default;
};
</script>

<style scoped>
.special-node {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    justify-content: space-around;
    width: 160px;
    height: 36px;
    background-color: #fff;
    border: 1px solid #c2c8d5;
    border-left: 4px solid #5F95FF;
    border-radius: 4px;
    box-shadow: 0 2px 5px 1px rgba(0, 0, 0, 0.06);
}

.special-node img {
    width: 20px;
    height: 20px;

}

.special-node .label {
    display: inline-block;
    height: 57px;
    line-height: 57px;
    width: 104px;
    margin-left: 8px;
    color: black;
    font-size: 12px;
}

.special-node .status {
    flex-shrink: 0;
}

/* .special-node .status img {
    animation: spin 1s linear infinite;
} */

.special-node.success {
    border-left: 4px solid #52c41a;
}

.special-node.failed {
    border-left: 4px solid #ff4d4f;
}

.special-node.running .status img {
    animation: spin 1s linear infinite;
}

.selected .special-node {
    border-color: #1890ff;
    border-radius: 2px;
    box-shadow: 0 0 0 4px #d4e8fe;
}

.selected .special-node.success {
    border-color: #52c41a;
    border-radius: 2px;
    box-shadow: 0 0 0 4px #ccecc0;
}

.selected .special-node.failed {
    border-color: #ff4d4f;
    border-radius: 2px;
    box-shadow: 0 0 0 4px #fedcdc;
}



/* Connection Handle styling */
.handle {
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: #fff;
    border: 2px solid #A3A3A3;
    border-radius: 50%;
    z-index: 10;
}

.handle:hover {
    background-color: #E7F3FF;
    border-color: #5F95FF;
}

.top {
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
}

.bottom {
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>