<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<title>${siteName!""} | kNN实验模块</title>
<#include "../../admin/common/header.ftl"/>
<style>
td{
	vertical-align:middle;
}
</style>
  <script src="/aial/js/commen/d3.v3.js"></script>
</head>

<body>
<div class="lyear-layout-web">
	    <div class="lyear-layout-container">
	          <!--左侧导航-->
	    <aside class="lyear-layout-sidebar">
	      
	      <!-- logo -->
	      <div id="logo" class="sidebar-header">
	        <a href="index.html"><img src="/admin/images/logo-sidebar.png" title="${siteName!""}" alt="${siteName!""}" /></a>
	      </div>
	      <div class="lyear-layout-sidebar-scroll"> 
	        <#include "../../admin/common/left-menu.ftl"/>
	      </div>
	      
	    </aside>
	    <!--End 左侧导航-->	
 		<#include "../../admin/common/header-menu.ftl"/>
 		
 		        <!--页面主要内容-->
        <main class="lyear-layout-content">
		<div class="container-fluid">
	        <div class="row">
	            <div class="col-md-6">
	                <div class="card" id="vs" style="width: 600px;height: 600px">
	                  
	                </div>
	            </div>
	            
	            <div class="col-md-6">
	                <div class="card">
	                    <div class="card-body" id="bton">
	                   			<!-- 点击开始按钮，显示数据集 -->
					        	<input type="button" id="start" class="btn btn-danger" value="开始" onclick="">
					        	<!-- 点击上一步按钮，返回上一步的状态-->
					            <input type="button" id="previous-step" class="btn btn-pink" value="上一步" onclick="">
					            <!-- 点击下一步按钮，画出下一步的状态-->
						        <input type="button" id="next-step" class="btn btn-primary" value="下一步" onclick="">
						        <!-- 点击添加数据集按钮后，用户可以添加样本点-->
					            <input type="button" id="addDataSet" class="btn btn-warning" value="添加数据集" onclick="">
					            <!-- 点击我要添加样本点按钮后，让用户输入合法的值，并要求用户判断属于哪一类，并给出评判-->
					            <input type="button" id="addSample" class="btn btn-purple" value="我要添加样本点" onclick="">
					            <!-- 点击结束，提示，恭喜完成该算法的学习 -->
					        	<input type="button" id="end" class="btn btn-success" value="结束" onclick="">
	                    </div>
	                </div>
	              
	                <div class="card">
	                    <div class="card-body">
	                        <div id="pseudo-code">
					            <p style="font-size: 15px;"><b>kNN算法的伪代码</b></p>
					            <p>对未知类别属性的数据集中的每个点依次执行以下操作：</p>
					            <ol>
					                <li id="li-1">增加一个样本点；</li>
					                <li id="li-2">计算已知类别数据集中的点与当前点之间的距离，并按照距离递增次序排序；</li>
					                <li id="li-3">选取与当前点距离最小的k个点；</li>
					                <li id="li-4">确定前k个点所在类别的出现频率，并返回出现频率最高的类别作为当前点的预测分类。</li>
					            </ol>
					        </div>
					        <div id="explaination"></div>
					        <br>
					        <div id="table" style="visibility: hidden;">
					            <p>该样本点到其他已分类点的距离（从小到大排序）:</p>
					            <table id="tbd" class="table table-hover">
					                <thead>
					                    <tr style="font-size: 14px;">
					                        <th>id</th>
					                        <th>坐标</th>
					                        <th>距离</th>
					                        <th>标签</th>
					                    </tr>
					                </thead>
					                <tbody>
					
					                </tbody>
					            </table>
					        </div>
	                    </div>
	                </div>
	              
	            </div>
	        </div>
	    </div>
    
        </main>
        <!--End 页面主要内容-->
 		
</div>


<#include "../../admin/common/footer.ftl"/>
<script type="text/javascript" src="/admin/js/perfect-scrollbar.min.js"></script>
<script type="text/javascript" src="/admin/js/main.min.js"></script>
<script type="text/javascript" src="/aial/js/kNN/kNN.js"></script>
<script type="text/javascript">
$(document).ready(function(){
	init();
	$("#start").click(function(){
		var val = document.getElementById("start");
		if(val.value == "开始"){
			start();
		}else if(val.value == "重新开始"){
			$.confirm({
		        title: '警告',
		        content: '确定要重新开始吗？一切将初始化！',
		        type: 'orange',
		        typeAnimated: false,
		        buttons: {
		            omg: {
		                text: '是的',
		                btnClass: 'btn-orange',
		                action: function () {
		                	start();
		                }
		            },
		            close: {
		                text: '不了',
		            }
		        }
		    });
		}
	});
	$("#previous-step").click(function(){
		if(times == 0){
			showMessage("没有上一步~请点击下一步按钮！", "warning", 0);
			return;
		}	
		countClickTimes('pre');
		if(times % 5 == 0){
			// 启用增加数据集和添加样本点按钮
			document.getElementById("addSample").disabled = false;
    		document.getElementById("addDataSet").disabled = false;
		}else{
			// 禁用增加数据集和添加样本点按钮
			document.getElementById("addSample").disabled = true;
    		document.getElementById("addDataSet").disabled = true;
		}
		loadProcess(times);
	});
	var d = 0, res, dic_dist;
	$("#next-step").click(function(){	
		countClickTimes('next');
		if(times % 5 == 0){
			// 启用增加数据集和添加样本点按钮
			document.getElementById("addSample").disabled = false;
    		document.getElementById("addDataSet").disabled = false;
		}else{
			// 禁用增加数据集和添加样本点按钮
			document.getElementById("addSample").disabled = true;
    		document.getElementById("addDataSet").disabled = true;
		}
		// 一共有四步：1、随机增加一个样本点； 2、画出辅助线和表格； 3、要求用户一个K值； 4、对样本点进行分类判断
		if(times % 5 == 1){
			clearTable();
			addSampleRandomly();
		}else if(times % 5 == 2){
			// 计算距离
    		dic_dist = distance();
    		// 对距离字典进行排序, 返回序号数组
		    res = Object.keys(dic_dist).sort(function(a, b){
		        return dic_dist[a] - dic_dist[b];
		    }); 
			//画出辅助线和距离表格
			drawLine();
			drawTable(dic_dist, res);
			console.log(res);
		}else if(times % 5 == 3){
			//要求用户输入近邻数K
			getK();
		}else if(times % 5 == 4){
			d = dic_dist[res[K-1]];
			console.log("d="+d);
			// 画出圆圈，将k个点包在里面，最好能有填充色
			drawCircle(d);
		}else if(times % 5 == 0){
			// 对该样本点进行判断
			var cls = classify(dic_dist, res);
			// 画出分类后的echart
			drawAfterClassified(cls);
			isFinished = true;
		}
		
	});
	$("#addDataSet").click(function(){	
		addData();
	});
	$("#addSample").click(function(){	
		countClickTimes('next');
		addMySample();
	});
	$("#end").click(function(){	
		checkExit();
	});
});

</script>
</body>
</html>