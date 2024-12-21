<template>
    <div :class="['custom-node', props.data.info.params.state]">
        <el-icon class="icon">
            <component :is="props.data.info.ico"></component>
        </el-icon>
        <span class="label">{{ props.data.label }}</span>
        <span class="status">
            <img v-if="props.data.info.status === 'success'"
                src="https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*6l60T6h8TTQAAAAAAAAAAAAAARQnAQ"
                alt="success" />
            <img v-if="node.data.status === 'failed'"
                src="https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*SEISQ6My-HoAAAAAAAAAAAAAARQnAQ"
                alt="failed" />
            <img v-if="node.data.status === 'running'"
                src="https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*t8fURKfgSOgAAAAAAAAAAAAAARQnAQ"
                alt="running" />

        </span>
    </div>
</template>

<script setup>
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
.custom-node {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #fff;
    border: 1px solid #c2c8d5;
    border-left: 4px solid #5F95FF;
    border-radius: 4px;
    box-shadow: 0 2px 5px 1px rgba(0, 0, 0, 0.06);
}

.custom-node img {
    width: 20px;
    height: 20px;

}

.custom-node .label {
    flex-shrink: 0;
    width: 104px;
    margin-left: 8px;
    color: #666;
    font-size: 12px;
}

.custom-node .status img {
    animation: spin 1s linear infinite;
}

.custom-node.success {
    border-left: 4px solid #52c41a;
}

.custom-node.failed {
    border-left: 4px solid #ff4d4f;
}

.icon {
    margin-right: 10px;
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