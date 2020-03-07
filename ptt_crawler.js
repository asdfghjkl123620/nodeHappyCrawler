function foo(){

};
//呼叫他執行
//FD可以被提升,可以先呼叫或宣告
foo();


goo();
function goo(){

};
//呼叫他執行
//FD可以被提升,可以先呼叫或宣告


const fe = function(){};

fe();
//FE名字被提升,內容不能提升
//FE一定要先宣告才能被呼叫