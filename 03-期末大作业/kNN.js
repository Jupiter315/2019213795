// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('vs'));
// 指定图表的配置项和数据
var option;
var legend;
var times;		// 记录进程
var isStarted; 	// 判断是否已经开始
var isFinished;	// 判断是否已经结束
var saveClusterK;
var saveClassified;
var saveSampleAdd;
var saveMySeries;
var saveExplaination;
var count;
var K = 0;		// 近邻数k
var myDataSet = [
	[
		[0.3, 0.8],
	    [0.31, 0.42],
	    [0.12, 0.75],
	    [0.4, 0.5]
	],[
		[0.55, 0.4],
		[0.9, 0.85],
	    [0.88, 0.25],
	    [0.75, 0.33],
	    [0.7, 0.1]
	]
];
// =================要改成可以适应多个cluster的代码，并且使用上一步下一步，开始，结束之类的，然后“我要添加样本点”-->然后用户进行判断，并反馈判断结果===========================
// 统计点击上一步、下一步按钮的次数
function countClickTimes(type){
	if(type == 'pre'){
		times--;
	}else if(type == 'next'){
		times++;
	}
}

//点击开始按钮前，禁用其他按钮
function button_disabled (state) {
    document.getElementById("previous-step").disabled = state;
    document.getElementById("next-step").disabled = state;
    document.getElementById("end").disabled = state;
	document.getElementById("addSample").disabled = state;
	document.getElementById("addDataSet").disabled = state;
}

// 将全集变量清空或初始化
function clear(){
	legend = [
		['未分类'],
		['未分类', 'cluster1'],
		['未分类', 'cluster1', 'cluster2'],
		['未分类', 'cluster1', 'cluster2', 'cluster3'],
		['未分类', 'cluster1', 'cluster2', 'cluster3', 'cluster4'],
		['未分类', 'cluster1', 'cluster2', 'cluster3', 'cluster4', 'cluster5'],
		['未分类', 'cluster1', 'cluster2', 'cluster3', 'cluster4', 'cluster5', 'cluster6']
	];
	
	times = 0;		// 统计进程
	
	isStarted = false; 	// 判断是否已经开始
	isFinished = false;	// 判断是否已经结束
	
	saveClusterK = [];
	saveClassified = [];
	saveSampleAdd = [];
	saveMySeries = [];
	saveExplaination = [];
	count = 0;
	
	var classified = myDataSet;
	var sampleAdd = [];		
	var clusterK = classified.length;
	var series = createMySeries(clusterK, classified, sampleAdd)
	saveProcess(clusterK, classified, sampleAdd, series, 0);
	myChart.clear();
	showExplain(0);
}

// 点击开始按钮
function start(){
	clear();
	showDataSet(saveClusterK[count-1], saveMySeries[count-1]);
	showMessage("成功显示数据集！", "success");
	// 修改开始为重新开始
	var value = document.getElementById("start");
    value.value="重新开始";
    isStarted = true;
    button_disabled(!isStarted);	// 启用按钮
}

//初始化界面
function init(){
	// 按钮区域
	showMessage("赶紧点击开始按钮进入实验吧！~", "info", 0);
	button_disabled(true);
	// 可视化区域
	option = {
	    tooltip: {	// 提示框
	        position: 'top',
	        showDelay: 0,
	        formatter: function (params) {
	                return 'id=' + params.dataIndex + ' [' + params.value[0] + ', '
	                + params.value[1] + '] '; 
	        }
	    },
	    legend: {	// 图例
		    	top: 15,
		    	data: [],
		    	textStyle: {
		            fontSize: 14
		        }
		    },
	    grid: {		// 网格
	        left: '4%',
	        bottom: '4%'
	    },
	    xAxis: {
	    },
	    yAxis: {
	    },
	    series: [{
	        symbolSize: 10,
	        data: [],
	        type: 'scatter'
	    }]
	};
	option && myChart.setOption(option);
}

//设置高亮
function setHighLight(li, width, webkitTextStrokeWidth){
	li.style.background = "yellow";
    li.style.width = width;
    li.style.webkitTextStrokeWidth = webkitTextStrokeWidth;
}
// 取消高亮
function delHighLight(li){
	li.style.background = "";
    li.style.webkitTextStrokeWidth = "";
}
function showExplain(num, sampleAdd=[]){
	var explain = document.getElementById('explaination');
	var o1 = document.getElementById("li-1");
	var o2 = document.getElementById("li-2");
	var o3 = document.getElementById("li-3");
	var o4 = document.getElementById("li-4");
	var len = sampleAdd.length;
	if(num == 0){
		explain.innerHTML = "";
		delHighLight(o1);
		delHighLight(o2);
		delHighLight(o3);
		delHighLight(o4);
	}else if(num == 1){
		delHighLight(o2);
		delHighLight(o3);
		delHighLight(o4);
		// 添加文字提示
	    explain.innerHTML = "新增样本点坐标：(" + sampleAdd[len-1] + ")" ;
	    explain.style.background = "pink";
	    // 设置高亮
	    setHighLight(o1, "115px", "0.5px");
	}else if(num == 2){
		delHighLight(o1);
		delHighLight(o3);
		delHighLight(o4);
	    setHighLight(o2, "483px", "0.5px");
	}else if(num == 3){
		delHighLight(o1);
		delHighLight(o2);
		delHighLight(o4);
	    setHighLight(o3, "215px", "0.5px");
	}else if(num == 4){
		delHighLight(o3);
		delHighLight(o2);
		delHighLight(o1);
	    setHighLight(o4, "483px", "0.5px");
	}
}
//创建自定义series，添加空白
function seriesAddSpace(series){
	var space = {
        data: [[]],
        type: 'scatter'
    };
	for(var i = 0; i < 100; i++){
		series.push(space);
	}
	return series;
}
// 创建散点图
function createMySeries(myClusterK, myClassified, mySample){
	console.log("create...");
	var mySeries = [];
	var unclassified = {
    	name: '未分类',
        symbolSize: 10,
        data: mySample,
        type: 'scatter'
    };
    mySeries.push(unclassified);
    var name = ['cluster1', 'cluster2', 'cluster3', 'cluster4', 'cluster5', 'cluster6'];
    for(var i = 0; i < myClusterK; i++){
    	var item = {};
    	item['name'] = name[i];
    	item['symbolSize'] = 10;
    	item['data'] = myClassified[i];
    	item['type'] = 'scatter';
    	mySeries.push(item);
    }
    return mySeries;
}
// 创建带辅助线的散点图
function createMySeriesWithLine(myClusterK, myClassified, mySample){
	var mySeries = createMySeries(myClusterK, myClassified, mySample);
	var color = ['#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#91cc75'];
    var name = ['辅助线1', '辅助线2', '辅助线3', '辅助线4', '辅助线5', '辅助线6']
    for(var i = 0; i < myClusterK; i++){
    	for(var j = 0; j < myClassified[i].length; j++){
    		var line = {};
			line['name'] = name[i];
			line['data'] = [mySample[0], myClassified[i][j]];
			line['type'] = 'line';
			line['lineStyle'] = { color : color[i]};
			mySeries.push(line);
    	}
    }
	return mySeries;
}
// 创建带圆的散点图
function createMySeriesWithCircle(myClusterK, myClassified, mySample, d){
	var mySeries = createMySeries(myClusterK, myClassified, mySample);
	var line = {
        type: 'line',
        showSymbol: false,
        clip: true,
        data: generateData(mySample[0], d)
    }
	mySeries.push(line);
	console.log(mySeries);
	return mySeries;
}
// 生成圆的公式，center:圆心；d:半径
function generateData(center, d) {
    var data = [];
    //console.log(center);
    //console.log(d);
    for (var i = 0; i < 200; i++) {
    	var hudu = 6 * (Math.PI / 180) * i;
    	var x = center[0] + Math.sin(hudu) * d;
    	var y = center[1] - Math.cos(hudu) * d;
        data.push([x, y]);
        //console.log([x,y]);
    }
    //console.log(data);
    return data;
}
//显示数据集，画出图形
function showDataSet(myClusterK, mySeries){
	// 可视化区域
	option = {
	    tooltip: {	// 提示框
	        position: 'top',
	        showDelay: 0,
	        formatter: function (params) {
	                return 'id=' + params.dataIndex + ' [' + params.value[0] + ', '
	                + params.value[1] + '] '; 
	        }
	    },
	    legend: {	// 图例
		    	top: 15,
		    	data: legend[myClusterK],
		    	textStyle: {
		            fontSize: 14
		        }
		    },
	    grid: {		// 网格
	        left: '4%',
	        bottom: '4%'
	    },
	    xAxis: {
	    },
	    yAxis: {
	    },
	    series: mySeries
	};
	option && myChart.setOption(option);
}
//随机产生一个样本点
var toFixed = Number.prototype.toFixed;
function addSampleRandomly(){
	var sampleAdd = [];
	// 随机添加一个样本点
	sampleAdd.push([+toFixed.call(Math.random(), 2), +toFixed.call(Math.random(), 2)]);
	// 保存series
	var series = createMySeries(saveClusterK[count-1], saveClassified[count-1], sampleAdd);
	series = seriesAddSpace(series);
	saveProcess(saveClusterK[count-1], saveClassified[count-1], sampleAdd, series, 1);
	// 添加文字提示
	showExplain(1, sampleAdd);
	showDataSet(saveClusterK[count-1], saveMySeries[count-1]);
	showMessage("成功随机产生一个样本点！", "success");
}
//自定义样本点
function addMySample(){
	$.confirm({
        title: '添加样本点',
        content: '' +
        '<form action="" class="formName">' +
        '<div class="form-group">' +
        '<label>横坐标</label>' +
        '<input type="text" placeholder="请输入小于1的数" class="x-coordinate form-control" required />' +
        '<br /><label>纵坐标</label>' +
        '<input type="text" placeholder="请输入小于1的数" class="y-coordinate form-control" required />' +
        '</div>' +
        '</form>',
        buttons: {
            formSubmit: {
                text: '提交',
                btnClass: 'btn-blue',
                action: function () {
                    var xCoordinate = this.$content.find('.x-coordinate').val();
                    var yCoordinate = this.$content.find('.y-coordinate').val();
                    if(!xCoordinate || xCoordinate > 1 || xCoordinate < 0){
                        $.alert('请按照提示输入合法的横坐标！');
                        return false;
                    }
                    if(!yCoordinate || yCoordinate > 1 || yCoordinate < 0){
                        $.alert('请按照提示输入合法的纵坐标！');
                        return false;
                    }
                    $.alert('<p><b>坐标是：</b> (' + xCoordinate + ', ' + yCoordinate + ')</p>');
                    var sampleAdd = [];
                	// 随机添加一个样本点
                	sampleAdd.push([xCoordinate, yCoordinate]);
                	// 保存series
                	var series = createMySeries(saveClusterK[count-1], saveClassified[count-1], sampleAdd);
                	series = seriesAddSpace(series);
                	saveProcess(saveClusterK[count-1], saveClassified[count-1], sampleAdd, series, 1);
                	// 添加文字提示
                	showExplain(1, sampleAdd);
                	showDataSet(saveClusterK[count-1], saveMySeries[count-1]);
        			showMessage("成功随机产生一个样本点！", "success");
        			// 禁用增加数据集和添加样本点按钮
        			document.getElementById("addSample").disabled = true;
        			document.getElementById("addDataSet").disabled = true;
        			clearTable();
                }
            },
            cancel: {
                text: '取消',
                action: function () {
                	countClickTimes('pre');
                }
            },
        },
        onContentReady: function () {
            var jc = this;
            this.$content.find('form').on('submit', function (e) {
                e.preventDefault();
                jc.$$formSubmit.trigger('click');
            });
        }
    });
}
//保存步骤(echat和解释文字)
function saveProcess(myClusterK, myClassified, mySampleAdd, mySeries, num=0){
	console.log("save...");
	saveClusterK.push(myClusterK);
	saveClassified.push(myClassified);
	saveSampleAdd.push(mySampleAdd);
	saveMySeries.push(mySeries);
	saveExplaination.push(num);
	count++;
}
// 加载保存的内容
function loadProcess(times){
	console.log("load...");
	//myChart.clear();
	console.log("times=" + times);
	console.log("count="+ count);
	count--;
	showDataSet(saveClusterK[times], saveMySeries[times]);
	//showDataSet(saveClusterK[count-1], saveMySeries[count-1]);
	showExplain(saveExplaination[times], saveSampleAdd[times]);
	//showExplain(saveExplaination[count-1], saveSampleAdd[count-1]);
	saveClusterK.pop();
	saveClassified.pop();
	saveSampleAdd.pop();
	saveMySeries.pop();
	saveExplaination.pop();
	if(times % 5 == 3) getK();
	if(times % 5 == 1) clearTable();
	console.log("explain");
	console.log(saveExplaination);
}
//要求用户输入近邻数k
function getK(){
	// 输入k值
	$.confirm({
        title: '提示',
        content: '' +
        '<form action="" class="formName">' +
        '<div class="form-group">' +
        '<label>请输入您想要近邻数k</label>' +
        '<input type="text" placeholder="k值" class="k form-control" required />' +
        '</div>' +
        '</form>',
        buttons: {
            formSubmit: {
                text: '提交',
                btnClass: 'btn-blue',
                action: function () {
                    var k = this.$content.find('.k').val();
                    if(!k){
                        $.alert('请输入k值！');
                        return false;
                    }
                    K = k;	// 保存用户输入的K值
                    $.alert('k = ' + k);
                    var explain = document.getElementById('explaination');
                    explain.innerHTML = "已输入的近邻数K = " + k ;
                }
            },
            cancel: {
                text: '取消'
            },
        }, 
    });
	saveProcess(saveClusterK[count-1], saveClassified[count-1], saveSampleAdd[count-1], saveMySeries[count-1], 3);
	// 添加文字提示
	showExplain(3);
}
//画出辅助线，圆
function drawCircle(d){
	var series = createMySeriesWithCircle(saveClusterK[count-1], saveClassified[count-1], saveSampleAdd[count-1], d);
	seriesAddSpace(series);
	console.log(series);
	saveProcess(saveClusterK[count-1], saveClassified[count-1], saveSampleAdd[count-1], series, 4);
	showDataSet(saveClusterK[count-1], series);
	// 消息提示
	showMessage('成功画出辅助圆！', 'success');
	// 添加文字提示
	showExplain(4);
}
//画出辅助线
function drawLine(){
	var series = createMySeriesWithLine(saveClusterK[count-1], saveClassified[count-1], saveSampleAdd[count-1]);
	showDataSet(saveClusterK[count-1], series);
	saveProcess(saveClusterK[count-1], saveClassified[count-1], saveSampleAdd[count-1], series, 2);
	// 消息提示
	showMessage('成功画出辅助线！', 'success');
	// 添加文字提示
	showExplain(2);
}
// 消除表格
function clearTable(){
	$(" tr:gt(0)").remove();
	var div = document.getElementById('table');
	div.style.visibility = "hidden";
}
// 画出表格
function drawTable(dic_dist, res){
	// 获取表格id，并显示表格
	var div = document.getElementById('table');
    div.style.visibility = "visible";
    // 画出表格
    var tbd = document.getElementById('tbd');
    var classified = saveClassified[count-1];
    var clusterK = classified.length;
    var k = 0;
    for(var key = 0; key < res.length; key++){
    	var value = parseInt(res[key]);
    	var len = 0, row = 0, col = 0;
    	for(var i = 0; i < clusterK; i++){
    		len += classified[i].length;
    		if(value < len) {
    			row = i;
    			if(i > 0){
    				col = value - (len - classified[i].length);
    			}else{
    				col = value;
    			}
    			break;
    		}
    	}
        var newtr = document.createElement('tr');
        tbd.appendChild(newtr);
        var td1 = document.createElement('td');
        var td2 = document.createElement('td');
        var td3 = document.createElement('td');
        var td4 = document.createElement('td');
        td1.innerHTML = col;
        td2.innerHTML = classified[row][col];
        td3.innerHTML = dic_dist[res[key]];
        td4.innerHTML = "cluster"+(row+1);
        newtr.appendChild(td1);
        newtr.appendChild(td2);
        newtr.appendChild(td3);
        newtr.appendChild(td4);
    }
    return res;
}
// 计算距离，欧氏距离
function distance(){
	var dist = {}; // "已分类样本点下标" : "距离"
	var len = saveClusterK[count-1];	// 已分类的簇的数量
	var classified = saveClassified[count-1];
	console.log(classified);
	console.log(len);
	var sample = saveSampleAdd[count-1][0];
	console.log(sample);
	var k = 0;
	for(var i = 0; i < len; i++){
		for(var j = 0; j < classified[i].length; j++){
			// d2=x2+y2
			d2 = Math.pow(sample[0]-classified[i][j][0], 2) + Math.pow(sample[1]-classified[i][j][1], 2);
			//console.log(d2);
			d = Math.pow(d2, 0.5);
			dist[k++] = d;
		}
	}
	//console.log(dist);
	return dist;
}
// 判断样本点所属的类别
function classify(dic_dist, res){
	var classified = saveClassified[count-1];
    var clusterK = classified.length;
    var array = [0,0,0,0,0,0];
    for(var key = 0; key < K; key++){
    	var value = parseInt(res[key]);
    	var cls = 0, len = 0;
    	for(var i = 0; i < clusterK; i++){
    		len += classified[i].length;
    		if(i > 0 && value < len && value >= (len - classified[i].length)){
    			cls = i;
    		}
    	}
    	array[cls] += 1;
    }
    var max = 0;
    for(var i = 1; i < clusterK; i++){
    	if(array[max] < array[i]){
    		max = i;
    	}
    }
    return max;
}
// 画出分类后的Echart
function drawAfterClassified(cls){
	var classified = changeClassified(saveClassified[count-1]);
	var sample = saveSampleAdd[count-1];
	var clusterK = saveClusterK[count-1];
	classified[cls].push(sample[0]);
	sample = [[]];
	console.log("sample");
	console.log(saveSampleAdd);
	var series = createMySeries(clusterK, classified, sample);
	showDataSet(clusterK, series);
	saveProcess(clusterK, classified, sample, series, 4);
	console.log(saveSampleAdd);
	// 添加文字提示
	showExplain(4);
}
// 为了防止全局变量同时改变
function changeClassified(classified){
	var cls = [];
	for(var i = 0; i < classified.length; i++){
		var row = [];
		for(var j = 0; j < classified[i].length; j++){
			row.push(classified[i][j]);
		}
		cls.push(row);
	}
	return cls;
}
// 添加数据集功能
function addData(){
	var range = parseInt(saveClusterK[count-1]) + 1;
	$.confirm({
        title: '添加数据集',
        content: '' +
        '<form action="" class="formName">' +
        '<div class="form-group">' +
        '<label>横坐标</label>' +
        '<input type="text" placeholder="请输入小于1的数" class="x-coordinate form-control" required />' +
        '<br /><label>纵坐标</label>' +
        '<input type="text" placeholder="请输入小于1的数" class="y-coordinate form-control" required />' +
        '<br /><label>类别</label>' +
        '<input type="text" placeholder="类别(1-' + range + ')" class="classification form-control" required />' +
        '</div>' +
        '</form>',
        buttons: {
            formSubmit: {
                text: '提交',
                btnClass: 'btn-blue',
                action: function () {
                    var xCoordinate = this.$content.find('.x-coordinate').val();
                    var yCoordinate = this.$content.find('.y-coordinate').val();
                    var classification = this.$content.find('.classification').val();
                    if(!xCoordinate || xCoordinate > 1 || xCoordinate < 0){
                        $.alert('请按照提示输入合法的横坐标！');
                        return false;
                    }
                    if(!yCoordinate || yCoordinate > 1 || yCoordinate < 0){
                        $.alert('请按照提示输入合法的纵坐标！');
                        return false;
                    }
                    if(!classification || classification < 1 || classification > range){
                        $.alert('请按照提示输入合法的类别！');
                        return false;
                    }
                    $.alert('<p><b>坐标是：</b> (' + xCoordinate + ', ' + yCoordinate + ')</p>' + '<p><b>类别是：</b> ' + classification + '</p>');
                    var dot = [parseFloat(xCoordinate), parseFloat(yCoordinate)];
                    console.log(dot);
                    myDataSet = saveClassified[count-1];
                    console.log(myDataSet);
                    if(classification == range){
                    	myDataSet.push([]);
                    }
                    myDataSet[classification-1].push(dot);
                    start();
                }
            },
            cancel: {
                text: '取消'
            },
        },
        onContentReady: function () {
            var jc = this;
            this.$content.find('form').on('submit', function (e) {
                e.preventDefault();
                jc.$$formSubmit.trigger('click');
            });
        }
    });
}
//退出前确认
function checkExit(){
	if(isFinished){
		$.confirm({
	        title: '成功',
	        content: '恭喜你完成k近邻实验！',
	        type: 'green',
	        buttons: {
	            omg: {
	                text: '谢谢',
	                btnClass: 'btn-green',
	                action: function () {
	                	window.location.href='/aial/k_means/list';
	                }
	            },
	            close: {
	                text: '再来一次',
	                action: function () {
	                	start();
	                }
	            }
	        }
	    });
	}else{
		$.confirm({
	        title: '退出',
	        content: '实验还未结束，确定要退出吗？',
	        type: 'orange',
	        typeAnimated: false,
	        buttons: {
	            omg: {
	                text: '是的',
	                btnClass: 'btn-orange',
	                action: function () {
	                	window.location.href='/aial/k_means/list';
	                }
	            },
	            close: {
	                text: '不了',
	            }
	        }
	    });
	}
}