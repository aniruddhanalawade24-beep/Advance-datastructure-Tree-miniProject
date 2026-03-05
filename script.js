/* Tree Node */

class Node{
constructor(name,type,parent=null){
this.name=name
this.type=type
this.children=[]
this.parent=parent
this.expanded=true
}
}

let root=new Node("Root","folder")
let selected=root

/* Render Tree */

function render(){

const tree=document.getElementById("tree")
tree.innerHTML=""

function build(node,parent){

let li=document.createElement("li")
li.textContent=node.name
li.className=node.type

if(node===selected) li.classList.add("selected")

li.onclick=(e)=>{
e.stopPropagation()
selected=node
updatePath()
render()
}

li.ondblclick=(e)=>{
e.stopPropagation()
node.expanded=!node.expanded
render()
}

parent.appendChild(li)

if(node.expanded && node.children.length){

let ul=document.createElement("ul")
li.appendChild(ul)

node.children.forEach(c=>build(c,ul))

}

}

build(root,tree)

updateStats()

}

/* Create Folder */

function createFolder(){

let name=document.getElementById("nameInput").value

if(!name) return

if(selected.type==="file"){
alert("Cannot create inside file")
return
}

let node=new Node(name,"folder",selected)

selected.children.push(node)

render()

}

/* Create File */

function createFile(){

let name=document.getElementById("nameInput").value

if(!name) return

if(selected.type==="file"){
alert("Cannot create inside file")
return
}

let node=new Node(name,"file",selected)

selected.children.push(node)

render()

}

/* Delete */

function deleteNode(){

if(selected===root){
alert("Cannot delete root")
return
}

let parent=selected.parent

parent.children=parent.children.filter(c=>c!==selected)

selected=root

render()

}

/* DFS Search */

function searchNode(){

let target=document.getElementById("nameInput").value

let result=document.getElementById("searchResult")

let path=null

function dfs(node,p){

if(node.name===target){
path=p+"/"+node.name
}

node.children.forEach(c=>dfs(c,p+"/"+node.name))

}

dfs(root,"")

result.innerText=path?path:"Not Found"

}

/* Path */

function updatePath(){

let p=[]
let n=selected

while(n){
p.unshift(n.name)
n=n.parent
}

document.getElementById("path").innerText=p.join("/")

}

/* Stats */

function updateStats(){

let count=0
let maxDepth=0

function dfs(node,depth){

count++

maxDepth=Math.max(maxDepth,depth)

node.children.forEach(c=>dfs(c,depth+1))

}

dfs(root,1)

document.getElementById("totalNodes").innerText=count
document.getElementById("depth").innerText=maxDepth

}

render()
updatePath()
