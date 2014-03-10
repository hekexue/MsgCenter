define(["../msgCenter/clientMessageCenter"], function(MsgCenter) {
    Ext.require('Ext.chart.*');
    var chart,
        timeAxis,
        store = Ext.create('Ext.data.JsonStore', {
            fields: ['serverTime', 'memo', 'cpu', 'loadAvg'],
            data: []
        }),
        serverStatusData = [],
        plugin = {
            id: "serverWatchPlugin",
            subscribe: {
                "onServerDataArrives": function(data) {
                    console.log(arguments);
                    // formatDatal
                    var status = plugin.formatData(data);
                    // add data to chart store
                    serverStatusData.push(status);
                    store.loadData(serverStatusData);
                }
            },
            formatData: function(data) {
                return {
                    serverTime: (new Date(data.serverTime)) / 1000-1390000000, //,
                    memo: data.memoryUsageRate * 100,
                    cpu: data.cpuUsage * 100,
                    loadAvg: data.loadAvg
                }
            }
        },
        msgCenter = MsgCenter.getInstance({
            msgPlugins: {
                serverWatchPlugin: plugin
            }
        });

    // create the status window when the js code loaded
    function initWindow() {
        var win = Ext.create('Ext.window.Window', {
            width: 800,
            height: 600,
            minHeight: 400,
            minWidth: 550,
            maximizable: true,
            title: 'Server Status',
            autoShow: true,
            layout: 'fit',
            items: [{
                xtype: 'chart',
                style: 'background:#fff',
                itemId: 'chartCmp',
                store: store,
                shadow: false,
                animate: true,
                legend: {
                    position: 'right'
                },
                axes: [{
                    type: 'Numeric',
                    minimum: 0,
                    maximum: 100,
                    position: 'left',
                    fields: ['memo', 'cpu', 'loadAvg'],
                    title: 'Useage Status Of Server',
                    grid: {
                        odd: {
                            fill: '#dedede',
                            stroke: '#ddd',
                            'stroke-width': 0.5
                        }
                    }
                }, {
                    type: 'Numeric',
                    position: 'bottom',
                    fields: ['serverTime'],
                    title: 'The Server Time',
                    grid: true
                }],
                series: [{
                    type: 'line',
                    smooth: true,
                    axis: ['left', 'bottom'],
                    xField: 'serverTime',
                    yField: 'memo',
                    label: {
                        display: 'none',
                        field: 'memo',
                        renderer: function(v) {
                            return v >> 0;
                        },
                        'text-anchor': 'middle'
                    },
                    markerConfig: {
                        radius: 2,
                        size: 2
                    }
                }, {
                    type: 'line',
                    axis: ['left', 'bottom'],
                    smooth: true,
                    xField: 'serverTime',
                    yField: 'cpu',
                    label: {
                        display: 'none',
                        field: 'cpu',
                        renderer: function(v) {
                            return v >> 0;
                        },
                        'text-anchor': 'middle'
                    },
                    markerConfig: {
                        radius: 2,
                        size: 2
                    }
                }, {
                    type: 'line',
                    axis: ['left', 'bottom'],
                    smooth: true,
                    xField: 'serverTime',
                    yField: 'loadAvg',
                    label: {
                        display: 'none',
                        field: 'loadAvg',
                        renderer: function(v) {
                            return v >> 0;
                        },
                        'text-anchor': 'middle'
                    },
                    markerConfig: {
                        radius: 2,
                        size: 2
                    }
                }]
            }]
        });

        chart = win.child('#chartCmp');
        timeAxis = chart.axes.get(1);
    }
    /**
     * connect the server to watch the status
     * @return {[type]} [description]
     */
    function connectServer() {
        msgCenter.connect("http://127.0.0.1:5000/");
    }

    /**
     * init this page
     * @return {[type]} [description]
     */
    function init() {
        connectServer();
        initWindow();
    }
    init();
    return {
        startWatch: function() {
            debugger;
            //connect the 
            msgCenter.send({
                id:"serverWatchPlugin",
                event: "startWatch",
                msg: {
                    interval: 2000
                }
            });
        },
        stopWatch: function() {
            msgCenter.send({
                id:"serverWatchPlugin",
                event: "stopWatch",
                msg: null
            });
        }
    }
});