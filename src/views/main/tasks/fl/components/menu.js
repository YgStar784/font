import { MoreFilled, Location, Coin, VideoPause, VideoPlay, Tickets, CaretBottom, CaretRight, Download, Document, Refresh } from '@element-plus/icons-vue';
import axios from 'axios'
import { ref } from 'vue'

export const menu = ref([
    {
        id: '1',
        type: 'node',
        name: '训练节点',
        ico: VideoPlay, // Correct icon usage
        open: true,
        visibleChildrenCount: 5,
        total: 0,
        children: [
            /*             { id: '11', type: 'node', name: '医院A', ico: Location, params: { cpu_capacity: 1, memory_capacity: 1, storage_capacity: 1, net_throughput: 10, state: 'failed' } }, 
                        { id: '12', type: 'node', name: '医院B', ico: Location, params: { cpu_capacity: 1, memory_capacity: 1, storage_capacity: 1, net_throughput: 10, state: 'success' } },  */
        ],
    },
    {
        id: '8',
        type: 'aggregator',
        name: '聚合节点',
        ico: VideoPlay, // Correct icon usage
        open: false,
        visibleChildrenCount: 5,
        total: 0,
        children: [
            /*             { id: '11', type: 'node', name: '医院A', ico: Location, params: { cpu_capacity: 1, memory_capacity: 1, storage_capacity: 1, net_throughput: 10, state: 'failed' } }, 
                        { id: '12', type: 'node', name: '医院B', ico: Location, params: { cpu_capacity: 1, memory_capacity: 1, storage_capacity: 1, net_throughput: 10, state: 'success' } },  */
        ],
    },
    {
        id: '6',
        type: 'custom',
        name: '代码编写模块',
        ico: VideoPause, // Correct icon usage
        open: false,
        visibleChildrenCount: 5,
        children: [{
            id: '61',
            type: 'custom',
            name: '代码编写',
            ico: Document,
            params: {
                type: 'codeEdit',

            }
        },/*  {
            id: '62',
            type: 'custom',
            name: '文件上传',
            ico: Document,
            params: {
                type: 'fileUpload',

            }
        }, */]
    },
    {
        id: '5',
        type: 'template',
        name: '配置模块',
        ico: VideoPause, // Correct icon usage
        open: false,
        visibleChildrenCount: 100,

        children: [
            {
                id: '51', type: 'template', name: 'AlexNet', ico: Tickets, params: {
                    model: {
                        model_type: "fed_model",
                        task_type: "classification",
                        n_epochs: 30,
                        optimizer: "sgd",
                        learning_rate: 0.01,
                        loss: "cross_entropy",
                        batch_size: 128,
                        tag: "AlexNet",
                        device: "cuda",
                    },
                    layers: [
                        { type: "conv2d", in_channels: 3, out_channels: 96, kernel_size: 11, stride: 4, padding: 2 },
                        { type: "relu" },
                        { type: "maxpool", kernel_size: 3, stride: 2 },
                        { type: "conv2d", in_channels: 96, out_channels: 256, kernel_size: 5, padding: 2 },
                        { type: "relu" },
                        { type: "maxpool", kernel_size: 3, stride: 2 },
                        { type: "conv2d", in_channels: 256, out_channels: 384, kernel_size: 3, padding: 1 },
                        { type: "relu" },
                        { type: "conv2d", in_channels: 384, out_channels: 384, kernel_size: 3, padding: 1 },
                        { type: "relu" },
                        { type: "conv2d", in_channels: 384, out_channels: 256, kernel_size: 3, padding: 1 },
                        { type: "relu" },
                        { type: "maxpool", kernel_size: 3, stride: 2 },
                        { type: "flatten" },
                        { type: "linear", in_features: 9216, out_features: 4096 },
                        { type: "relu" },
                        { type: "dropout", p: 0.5 },
                        { type: "linear", in_features: 4096, out_features: 4096 },
                        { type: "relu" },
                        { type: "dropout", p: 0.5 },
                        { type: "linear", in_features: 4096, out_features: 1000 },
                        { type: "softmax", dim: 1 }
                    ]

                }
            },
            {
                id: '52', type: 'template', name: 'CNN', ico: Tickets, params: {
                    model: {
                        model_type: "fed_model",
                        task_type: "classification",
                        n_epochs: 10,
                        optimizer: "adam",
                        learning_rate: 0.001,
                        loss: "cross_entropy",
                        batch_size: 64,
                        tag: "SimpleCNN",
                        device: "cpu",
                        n_components: 10,
                    },
                    layers: [
                        { type: "conv2d", in_channels: 1, out_channels: 32, kernel_size: 3, stride: 1, padding: 1 },
                        { type: "relu" },
                        { type: "maxpool", kernel_size: 2, stride: 2 },
                        { type: "conv2d", in_channels: 32, out_channels: 64, kernel_size: 3, stride: 1, padding: 1 },
                        { type: "relu" },
                        { type: "maxpool", kernel_size: 2, stride: 2 },
                        { type: "flatten" },
                        { type: "linear", in_features: 3136, out_features: 128 },
                        { type: "relu" },
                        { type: "dropout", p: 0.5 },
                        { type: "linear", in_features: 128, out_features: 10 },
                        { type: "softmax", dim: 1 }
                    ]

                }
            },
            {
                id: '53', type: 'template', name: 'Linear Regression', ico: Tickets, params: {
                    model: {
                        model_type: "fed_model",
                        task_type: "regression",
                        n_epochs: 20,
                        optimizer: "adam",
                        learning_rate: 0.005,
                        loss: "mse",
                        batch_size: 32,
                        tag: "SimpleRegression",
                        device: "cpu",
                    },
                    layers: [
                        { type: "linear", in_features: 10, out_features: 50 },
                        { type: "relu" },
                        { type: "linear", in_features: 50, out_features: 50 },
                        { type: "relu" },
                        { type: "linear", in_features: 50, out_features: 1 }
                    ]

                }
            },
            {
                id: '54', type: 'template', name: 'LSTM', ico: Tickets, params: {
                    model: {
                        model_type: "fed_model",
                        task_type: "classification",
                        n_epochs: 20,
                        optimizer: "adam",
                        learning_rate: 0.001,
                        loss: "cross_entropy",
                        batch_size: 64,
                        tag: "lstm_sequence_classification",
                        device: "cuda",
                    },
                    layers: [
                        {
                            type: "lstm",
                            input_size: 100,
                            hidden_size: 200,
                            num_layers: 3,
                            batch_first: true,
                            Dropout: 0.3,
                            bidirectional: true
                        },
                        {
                            type: "linear",
                            in_features: 400,
                            out_features: 10
                        },
                        {
                            type: "softmax",
                            dim: 1
                        }
                    ]

                }
            },
            {
                id: '55', type: 'template', name: 'Transformer', ico: Tickets, params: {
                    model: {
                        model_type: "fed_model",
                        task_type: "regression",
                        n_epochs: 15,
                        optimizer: "sgd",
                        learning_rate: 0.01,
                        loss: "mse",
                        batch_size: 32,
                        tag: "transformer_regression",
                        device: "cuda",
                    },
                    layers: [
                        {
                            type: "transformer",
                            d_model: 256,
                            nhead: 8,
                            num_encoder_layers: 6,
                            num_decoder_layers: 6,
                            dim_feedforward: 1024,
                            Dropout: 0.1,
                            activation: "gelu"
                        },
                        {
                            type: "linear",
                            in_features: 256,
                            out_features: 1
                        }
                    ]

                }
            },
            {
                id: '56',
                type: 'template',
                name: 'MnistCNN',
                ico: Tickets,
                params: {
                    model: {
                        model_type: "fed_model",
                        task_type: "multi_classification",
                        n_epochs: 1,
                        optimizer: "sgd",
                        learning_rate: 0.1,
                        loss: "ce",
                        batch_size: 32,
                        tag: "mnist_cnn",
                        device: "cuda",
                        n_components: 1,
                    },
                    layers: [
                        { type: "conv2d", in_channels: 1, out_channels: 32, kernel_size: 3, padding: 1, stride: 1 },
                        { type: "relu" },
                        { type: "maxpool", kernel_size: 2, stride: 2, padding: 0 },
                        { type: "conv2d", in_channels: 32, out_channels: 64, kernel_size: 3, padding: 1, stride: 1 },
                        { type: "relu" },
                        { type: "maxpool", kernel_size: 2, stride: 2, padding: 0 },
                        { type: "reshape", shape: [-1, 7, 7, 64] },
                        { type: "linear", in_features: 3136, out_features: 128 },
                        { type: "linear", in_features: 128, out_features: 10 },
                        { type: "softmax", dim: 1 }
                    ]
                }
            },
            {
                id: '31',
                type: 'layer',
                name: 'Conv1D',
                ico: Document,
                params: {
                    type: 'conv1d',
                    in_channels: 1,
                    out_channels: 32,
                    kernel_size: 3,
                    padding: 1,
                    stride: 0,
                }
            },
            {
                id: '32',
                type: 'layer',
                name: 'ReLU',
                ico: Document,
                params: {
                    type: 'relu'
                }
            },

            {
                id: '34',
                type: 'layer',
                name: 'Conv2D',
                ico: Document,
                params: {
                    type: 'conv2d',
                    in_channels: 32,
                    out_channels: 64,
                    kernel_size: 3,
                    stride: 1,
                    padding: 0,

                }
            },
            {
                id: '35',
                type: 'layer',
                name: 'Transformer',
                ico: Document,
                params: {
                    type: 'transformer',
                    d_model: 512,
                    nhead: 8,
                    num_encoder_layers: 6,
                    num_decoder_layers: 6,
                    dim_feedforward: 2048,
                    Dropout: 0.1,
                    activation: 'ReLU',
                }
            },
            {
                id: '36',
                type: 'layer',
                name: 'LSTM',
                ico: Document,
                params: {
                    type: 'lstm',

                    input_size: 10,
                    hidden_size: 128,
                    num_layers: 1,
                    batch_first: true,
                    Dropout: 0,
                    bidirectional: false,
                }
            },
            {
                id: '37',
                type: 'layer',
                name: 'MaxPool',
                ico: Document,
                params: {
                    type: 'maxpool',
                    kernel_size: 3,
                    stride: 2,
                    padding: 0,
                }
            },
            {
                id: '38',
                type: 'layer',
                name: 'BatchNorm1D',
                ico: Document,
                params: {
                    type: 'batchnorm1d',

                    num_features: 128,
                    eps: 1e-5,
                    momentum: 0.1,
                }
            },
            {
                id: '39',
                type: 'layer',
                name: 'Flatten',
                ico: Document,
                params: {
                    type: 'flatten'
                }
            },
            {
                id: '310',
                type: 'layer',
                name: 'Reshape',
                ico: Document,
                params: {
                    type: 'reshape',
                    shape: [32, 3, 224, 224]
                }
            },
            {
                id: '311',
                type: 'layer',
                name: 'Linear',
                ico: Document,
                params: {
                    type: 'linear',
                    in_features: 128,
                    out_features: 64,
                }
            },

            {
                id: '312',
                type: 'layer',
                name: 'Softmax',
                ico: Document,
                params: {
                    type: 'softmax',
                    dim: 1
                }
            },
            {
                id: '313',
                type: 'layer',
                name: 'Sigmoid',
                ico: Document,
                params: {
                    type: 'sigmoid',
                }
            },
            {
                id: '314',
                type: 'layer',
                name: 'ReLU',
                ico: Document,
                params: {
                    type: 'relu',
                }
            },
            {
                id: '316',
                type: 'layer',
                name: 'LazyConv1d',
                ico: Document,
                params: {
                    type: 'lazy_conv1d',
                }
            },
            {
                id: '315',
                type: 'layer',
                name: 'LazyConv2d',
                ico: Document,
                params: {
                    type: 'lazy_conv2d',
                }
            },
            {
                id: '317',
                type: 'layer',
                name: 'LazyLinear',
                ico: Document,
                params: {
                    type: 'lazy_linear',
                }
            },

            {
                id: '41',
                type: 'algorithm',
                name: 'FedSGD',
                ico: Document,
                params: {
                    algorithm_type: 'FedSGD',
                    code: 1,
                }
            }, {
                id: '42',
                type: 'algorithm',

                name: 'FedAvg',
                ico: Document,
                params: {
                    code: 2,
                    algorithm_type: 'FedAvg',

                }
            }, {
                id: '43',
                type: 'algorithm',

                name: 'FedProx',
                ico: Document,
                params: {
                    code: 1001,
                    mu: 0.1,
                    algorithm_type: 'FedProx',

                }
            }, {
                id: '44',
                type: 'algorithm',

                algorithm_type: 'Scaffold',
                name: 'Scaffold',
                ico: Document,
                params: {
                    algorithm_type: 'Scaffold',

                    code: 1002,
                }

            }, {
                id: '45',
                type: 'algorithm',
                name: 'Fednova',
                ico: Document,
                params: {
                    code: 1003,
                    algorithm_type: 'Fednova',

                }
            }, {
                id: '46',
                name: 'MOON',
                type: 'algorithm',
                ico: Document,
                params: {
                    code: 1004,
                    mu: 0.1,
                    tau: 0.5,
                    algorithm_type: 'MOON',

                }
            }, {
                id: '47',
                type: 'algorithm',

                name: 'pFedMe',
                ico: Document,
                params: {
                    code: 1005,
                    beta: 0.01,
                    lambda: 15,
                    nu: 0.1,
                    algorithm_type: 'pFedMe',

                }
            }, /* {
                id: '48',
                type: 'algorithm',

                name: 'IFCA',
                ico: Document,
                params: {
                    code: 1006,
                    algorithm_type: 'IFCA',

                }
            },  *//* {
                id: '49',
                type: 'algorithm',

                name: 'FedEM',
                ico: Document,
                params: {
                    code: 1007,
                    algorithm_type: 'FedEM',

                }
            }, */ {
                id: '410',
                type: 'algorithm',

                name: 'FedMut',
                ico: Document,
                params: {
                    code: 1008,
                    early_round_threshold: 10,
                    algorithm_type: 'FedMut',

                }
            }, {
                id: '411',
                type: 'algorithm',

                name: 'FedCross',
                ico: Document,
                params: {
                    code: 1009,
                    cross_mode: 'in_order',
                    alpha: 0.5,
                    algorithm_type: 'FedCross',

                }
            }, {
                id: '412',
                type: 'algorithm',

                name: 'FedMR',
                ico: Document,
                params: {
                    code: 1010,
                    early_round_threshold: 10,
                    algorithm_type: 'FedMR',

                }
            }, {
                id: '413',
                type: 'algorithm',

                name: 'DFedAvgM',
                ico: Document,
                params: {
                    code: 2001,
                    algorithm_type: 'DFedAvgM',

                    momentum: 0.9,
                }
            }, {
                id: '414',
                type: 'algorithm',

                name: 'QuantizedDFedAvgM',
                ico: Document,
                params: {
                    code: 2002,
                    algorithm_type: 'QuantizedDFedAvgM',

                    momentum: 0.9,
                    q_step: 0.1,
                    q_bit: 8,
                }
            }, {
                id: '415',
                type: 'algorithm',

                name: 'DisPFL',
                ico: Document,
                params: {
                    code: 2003,
                    algorithm_type: 'DisPFL',

                    sparse: null,
                    erk_power_scale: null,
                    anneal_factor: null,
                }
            }, {
                id: '416',
                type: 'algorithm',

                algorithm_type: 'NET-FLEET',
                name: 'NET-FLEET',
                ico: Document,
                params: {
                    code: 2004,
                }

            }, {
                id: '417',
                type: 'algorithm',

                name: 'MPCAvg',
                ico: Document,
                params: {
                    algorithm_type: 'MPCAvg',

                    code: 3001,
                }

            }, {
                id: '418',
                type: 'algorithm',

                name: 'Krum',
                ico: Document,
                params: {
                    code: 3002,
                    algorithm_type: 'Krum',

                    n_malicious: 1,
                }
            }, {
                id: '419',
                type: 'algorithm',

                name: 'MedianAggr',
                ico: Document,
                params: {
                    algorithm_type: 'MedianAggr',

                    code: 3003,
                    method: 'marginal_median',
                    n_malicious: 1,
                }
            }, {
                id: '420',
                type: 'algorithm',

                name: 'TrimmedMeanAggr',
                ico: Document,
                params: {
                    algorithm_type: 'TrimmedMeanAggr',

                    code: 3004,
                    alpha: 0.1,
                }
            }, {
                id: '421',
                type: 'algorithm',

                name: 'Bulyan',
                ico: Document,
                params: {
                    code: 3005,
                    algorithm_type: 'Bulyan',

                    n_malicious: 1,
                    aggr_rule: 'median',
                }
            }, {
                id: '422',
                type: 'algorithm',

                name: 'DPAvg',
                ico: Document,
                params: {
                    code: 3006,
                    algorithm_type: 'DPAvg',

                    total_epsilon: 1.0,
                    delta: 1e-5,
                    target: ['weights'],
                    dp_alg: 'gaussian',
                }
            }, {
                id: '423',
                type: 'algorithm',

                name: 'PaillierAvg',
                ico: Document,
                params: {
                    algorithm_type: 'PaillierAvg',

                    code: 3007,
                }

            }, {
                id: '424',
                type: 'algorithm',

                name: 'FoolsGold',
                ico: Document,
                params: {
                    code: 3008,
                    algorithm_type: 'FoolsGold',

                    confidence: 0.5,
                }
            }, {
                id: '425',
                type: 'algorithm',

                name: 'BatchCrypt',
                ico: Document,
                params: {
                    code: 3009,
                    algorithm_type: 'BatchCrypt',

                    distribution: 'uniform',
                    batch_encode_size: 128,
                    bit_width: 32,
                }
            }

            // Correct icon usage
        ],
    },
    /*     {
            id: '2',
            type: 'model',
            name: '模型',
            ico: VideoPause, // Correct icon usage
            open: false,
            visibleChildrenCount: 5,
    
            children: [
                {
                    id: '21', type: 'model', name: '联邦模型', ico: Coin, params: {
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
                },
                {
                    id: '22', type: 'model', name: '聚类模型', ico: Coin, params: {
                        tag: 'mnist_cnn',
                        device: 'cuda',
                        model_type: 'cluster_model',
                        task_type: 'multi_classification',
                        n_epochs: 1,
                        n_components: 1,
                        batch_size: 32,
                        optimizer: 'adam',
                        learning_rate: 0.001,
                        loss: 'ce',
                    }
                }, // Correct icon usage
                {
                    id: '23', type: 'model', name: '混合模型', ico: Coin, params: {
                        tag: 'mnist_cnn',
                        device: 'cuda',
                        model_type: 'mixture_model',
                        task_type: 'multi_classification',
                        n_epochs: 1,
                        n_components: 1,
                        batch_size: 32,
                        optimizer: 'adam',
                        learning_rate: 0.001,
                        loss: 'ce',
                    }
                }, // Correct icon usage
            ],
        }, */

    /*  {
         id: '3',
         type: 'layer',
         name: '层配置',
         ico: VideoPause, // Correct icon usage
         open: false,
         visibleChildrenCount: 5,
 
         children: [
             {
                 id: '31',
                 type: 'layer',
                 name: 'Conv1D',
                 ico: Document,
                 params: {
                     type: 'conv1d',
                     in_channels: 1,
                     out_channels: 32,
                     kernel_size: 3,
                     padding: 1,
                     stride: 0,
                 }
             },
             {
                 id: '32',
                 type: 'layer',
                 name: 'ReLU',
                 ico: Document,
                 params: {
                     type: 'relu'
                 }
             },
 
             {
                 id: '34',
                 type: 'layer',
                 name: 'Conv2D',
                 ico: Document,
                 params: {
                     type: 'Conv2D',
                     in_channels: 32,
                     out_channels: 64,
                     kernel_size: 3,
                     stride: 1,
                     padding: 0,
 
                 }
             },
             {
                 id: '35',
                 type: 'layer',
                 name: 'transformer',
                 ico: Document,
                 params: {
                     type: 'transformer',
 
                     d_model: 512,
                     nhead: 8,
                     num_encoder_layers: 6,
                     num_decoder_layers: 6,
                     dim_feedforward: 2048,
                     Dropout: 0.1,
                     activation: 'ReLU',
                 }
             },
             {
                 id: '36',
                 type: 'layer',
                 name: 'LSTM',
                 ico: Document,
                 params: {
                     type: 'LSTM',
 
                     input_size: 10,
                     hidden_size: 128,
                     num_layers: 1,
                     batch_first: true,
                     Dropout: 0,
                     bidirectional: false,
                 }
             },
             {
                 id: '37',
                 type: 'layer',
                 name: 'MaxPool',
                 ico: Document,
                 params: {
                     type: 'MaxPool',
 
                     kernel_size: 3,
                     stride: 2,
                     padding: 0,
                 }
             },
             {
                 id: '38',
                 type: 'layer',
                 name: 'BatchNorm1d',
                 ico: Document,
                 params: {
                     type: 'BatchNorm1d',
 
                     num_features: 128,
                     eps: 1e-5,
                     momentum: 0.1,
                 }
             },
             {
                 id: '39',
                 type: 'layer',
                 name: 'Flatten',
                 ico: Document,
                 params: {
                     type: 'Flatten'
                 }
             },
             {
                 id: '310',
                 type: 'layer',
                 name: 'Reshape',
                 ico: Document,
                 params: {
                     type: 'Reshape',
                     shape: [32, 3, 224, 224]
                 }
             },
             {
                 id: '311',
                 type: 'layer',
                 name: 'Linear',
                 ico: Document,
                 params: {
                     type: 'Linear',
                     in_features: 128,
                     out_features: 64,
                 }
             },
 
             {
                 id: '312',
                 type: 'layer',
                 name: 'Softmax',
                 ico: Document,
                 params: {
                     type: 'Softmax',
                     dim: 1
                 }
             },
             {
                 id: '313',
                 type: 'layer',
                 name: 'sigmoid',
                 ico: Document,
                 params: {
                     type: 'sigmoid',
                 }
             },
             {
                 id: '314',
                 type: 'layer',
                 name: 'ReLU',
                 ico: Document,
                 params: {
                     type: 'relu',
                 }
             },
             {
                 id: '315',
                 type: 'layer',
                 name: 'LazyConv2d',
                 ico: Document,
                 params: {
                     type: 'LazyConv2d',
                 }
             },
             {
                 id: '316',
                 type: 'layer',
                 name: 'lazy_conv2d',
                 ico: Document,
                 params: {
                     type: 'lazy_conv2d',
                 }
             },
             {
                 id: '317',
                 type: 'layer',
                 name: 'LazyLinear',
                 ico: Document,
                 params: {
                     type: 'lazy_linear',
                 }
             },
         ],
     }, */
    /*     {
            id: '4',
            type: 'algorithm',
            name: '聚合算法',
            ico: VideoPause, // Correct icon usage
            open: false,
            visibleChildrenCount: 5,
    
            children: [
                {
                    id: '41',
                    type: 'algorithm',
                    name: 'FedSGD',
                    ico: Document,
                    params: {
                        algorithm_type: 'FedSGD',
                        code: 1,
                    }
                }, {
                    id: '42',
                    type: 'algorithm',
    
                    name: 'FedAvg',
                    ico: Document,
                    params: {
                        code: 2,
                        algorithm_type: 'FedAvg',
    
                    }
                }, {
                    id: '43',
                    type: 'algorithm',
    
                    name: 'FedProx',
                    ico: Document,
                    params: {
                        code: 1001,
                        mu: 0.1,
                        algorithm_type: 'FedProx',
    
                    }
                }, {
                    id: '44',
                    type: 'algorithm',
    
                    algorithm_type: 'Scaffold',
                    name: 'Scaffold',
                    ico: Document,
                    params: {
                        algorithm_type: 'Scaffold',
    
                        code: 1002,
                    }
    
                }, {
                    id: '45',
                    type: 'algorithm',
                    name: 'Fednova',
                    ico: Document,
                    params: {
                        code: 1003,
                        algorithm_type: 'Fednova',
    
                    }
                }, {
                    id: '46',
                    name: 'MOON',
                    type: 'algorithm',
                    ico: Document,
                    params: {
                        code: 1004,
                        mu: 0.1,
                        tau: 0.5,
                        algorithm_type: 'MOON',
    
                    }
                }, {
                    id: '47',
                    type: 'algorithm',
    
                    name: 'pFedMe',
                    ico: Document,
                    params: {
                        code: 1005,
                        beta: 0.01,
                        lambda: 15,
                        nu: 0.1,
                        algorithm_type: 'pFedMe',
    
                    }
                }, {
                    id: '48',
                    type: 'algorithm',
    
                    name: 'IFCA',
                    ico: Document,
                    params: {
                        code: 1006,
                        algorithm_type: 'IFCA',
    
                    }
                }, {
                    id: '49',
                    type: 'algorithm',
    
                    name: 'FedEM',
                    ico: Document,
                    params: {
                        code: 1007,
                        algorithm_type: 'FedEM',
    
                    }
                }, {
                    id: '410',
                    type: 'algorithm',
    
                    name: 'FedMut',
                    ico: Document,
                    params: {
                        code: 1008,
                        early_round_threshold: 10,
                        algorithm_type: 'FedMut',
    
                    }
                }, {
                    id: '411',
                    type: 'algorithm',
    
                    name: 'FedCross',
                    ico: Document,
                    params: {
                        code: 1009,
                        cross_mode: 'in_order',
                        alpha: 0.5,
                        algorithm_type: 'FedCross',
    
                    }
                }, {
                    id: '412',
                    type: 'algorithm',
    
                    name: 'FedMR',
                    ico: Document,
                    params: {
                        code: 1010,
                        early_round_threshold: 10,
                        algorithm_type: 'FedMR',
    
                    }
                }, {
                    id: '413',
                    type: 'algorithm',
    
                    name: 'DFedAvgM',
                    ico: Document,
                    params: {
                        code: 2001,
                        algorithm_type: 'DFedAvgM',
    
                        momentum: 0.9,
                    }
                }, {
                    id: '414',
                    type: 'algorithm',
    
                    name: 'QuantizedDFedAvgM',
                    ico: Document,
                    params: {
                        code: 2002,
                        algorithm_type: 'QuantizedDFedAvgM',
    
                        momentum: 0.9,
                        q_step: 0.1,
                        q_bit: 8,
                    }
                }, {
                    id: '415',
                    type: 'algorithm',
    
                    name: 'DisPFL',
                    ico: Document,
                    params: {
                        code: 2003,
                        algorithm_type: 'DisPFL',
    
                        sparse: null,
                        erk_power_scale: null,
                        anneal_factor: null,
                    }
                }, {
                    id: '416',
                    type: 'algorithm',
    
                    algorithm_type: 'NET-FLEET',
                    name: 'NET-FLEET',
                    ico: Document,
                    params: {
                        code: 2004,
                    }
    
                }, {
                    id: '417',
                    type: 'algorithm',
    
                    name: 'MPCAvg',
                    ico: Document,
                    params: {
                        algorithm_type: 'MPCAvg',
    
                        code: 3001,
                    }
    
                }, {
                    id: '418',
                    type: 'algorithm',
    
                    name: 'Krum',
                    ico: Document,
                    params: {
                        code: 3002,
                        algorithm_type: 'Krum',
    
                        n_malicious: 1,
                    }
                }, {
                    id: '419',
                    type: 'algorithm',
    
                    name: 'MedianAggr',
                    ico: Document,
                    params: {
                        algorithm_type: 'MedianAggr',
    
                        code: 3003,
                        method: 'marginal_median',
                        n_malicious: 1,
                    }
                }, {
                    id: '420',
                    type: 'algorithm',
    
                    name: 'TrimmedMeanAggr',
                    ico: Document,
                    params: {
                        algorithm_type: 'TrimmedMeanAggr',
    
                        code: 3004,
                        alpha: 0.1,
                    }
                }, {
                    id: '421',
                    type: 'algorithm',
    
                    name: 'Bulyan',
                    ico: Document,
                    params: {
                        code: 3005,
                        algorithm_type: 'Bulyan',
    
                        n_malicious: 1,
                        aggr_rule: 'median',
                    }
                }, {
                    id: '422',
                    type: 'algorithm',
    
                    name: 'DPAvg',
                    ico: Document,
                    params: {
                        code: 3006,
                        algorithm_type: 'DPAvg',
    
                        total_epsilon: 1.0,
                        delta: 1e-5,
                        target: ['weights'],
                        dp_alg: 'gaussian',
                    }
                }, {
                    id: '423',
                    type: 'algorithm',
    
                    name: 'PaillierAvg',
                    ico: Document,
                    params: {
                        algorithm_type: 'PaillierAvg',
    
                        code: 3007,
                    }
    
                }, {
                    id: '424',
                    type: 'algorithm',
    
                    name: 'FoolsGold',
                    ico: Document,
                    params: {
                        code: 3008,
                        algorithm_type: 'FoolsGold',
    
                        confidence: 0.5,
                    }
                }, {
                    id: '425',
                    type: 'algorithm',
    
                    name: 'BatchCrypt',
                    ico: Document,
                    params: {
                        code: 3009,
                        algorithm_type: 'BatchCrypt',
    
                        distribution: 'uniform',
                        batch_encode_size: 128,
                        bit_width: 32,
                    }
                }
            ],
        }, */

])