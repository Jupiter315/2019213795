// 显示课程信息
function showDetails(event){
    const lesson = event.currentTarget;     // 获取鼠标悬浮的DOM元素
    const classes = document.querySelectorAll('.classes');  // 获取表格中所有有课程的td元素
    for(var i = 0; i < classes.length; i++){
        if(lesson === classes[i]){          // 根据i的值判断是哪一个课程需要显示
            var className = ".class-" + i;
            const dom = document.querySelector(className);
            dom.classList.remove('hidden');
        }
    }
}
// 将课程信息隐藏
function hideDetails(event){        
    const classes = document.querySelectorAll('.inform');
    for(var i = 0; i < classes.length; i++){
        classes[i].classList.add('hidden');
    }
}
// 绑定鼠标事件
const lessons = document.querySelectorAll('.classes');
for(var i = 0; i < lessons.length; i++){
    lessons[i].addEventListener("mouseenter", showDetails);
    lessons[i].addEventListener("mouseleave", hideDetails);
}
