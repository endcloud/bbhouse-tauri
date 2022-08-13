<script setup lang="ts">
import {Component, h} from "vue"
import {ElLink} from "element-plus/es"
import {Edit} from "@element-plus/icons-vue"

const list = Array(100).fill(1)
const list1 = [...Array(100).keys()]

const user: Component = {template: '<div style="display: flex; align-items: center; justify-content: flex-end">User<Share style="width: 1em; height: 1em; margin-left: 8px" /></div>'}
const config: Component = {template: '<div style="display: flex; align-items: center; justify-content: flex-end" class="flex">Config<Tools style="width: 1em; height: 1em; margin-left: 8px" /></div>'}

const icon_user = h(user)
const icon_config_link = h(ElLink, {icon: Edit}, h("span", "Edit"))
const icon_config = h(config)

</script>

<template>
  <!--      <div v-if="state.showList.filter(ele => state.tagIndex[tag].includes(ele.tid)).length > 0" v-bind:class="{skeleton: state.loading, main_area: true}">-->
  <!--        <div class="card_container" v-for="item in state.showList.filter(ele => state.tagIndex[tag].includes(ele.tid))">-->
  <!--          <div @click="play(item.param)" class="img-card">-->
  <!--            <img :src="item.cover+'@200w_113h'" alt="cover">-->
  <!--            <div class="title-container">-->
  <!--              <div class="my-title main-title">{{item.title}}</div>-->
  <!--              <div class="my-title author">{{item.name}}</div>-->
  <!--              <div class="my-title ctime">{{useTs2Time(item.ctime)}}</div>-->
  <!--            </div>-->
  <!--          </div>-->
  <!--        </div>-->
  <!--      </div>-->
</template>


<style scoped lang="less">
.main_area{
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-content: flex-start;
  list-style-type: none;
  padding: 0;
}

.card_container{
  flex-grow: 1;
  flex-basis: 1rem;
  text-align: center;
//padding: 10px;
//margin: 10px;
  list-style:none;
//border: 1px solid #222;
}

.skeleton{
  visibility:hidden
}

:hover.img-card{
  background: white;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
}

.img-card img{
  width: 3rem;
  height: 2rem;
  /*border-radius: 12px;*/
  float: left;
}

@media screen and (max-device-width:330px) {
  div.img-card {
    margin: auto auto;
    width: 8rem;
    height: 2.7rem;
    /*text-align: center;*/
    overflow: hidden;
    cursor: pointer;
  }
  .img-card img{
    margin-top: 0.2rem;
  }
  div.my-title{
    margin: 0 0.1rem 0 0.1rem;
  }
  div.main-title{
    height: 1.5rem;
  }
}

@media screen and (max-device-width:767px) {
  div.img-card {
    margin: auto auto;
    width: 8rem;
    height: 2.3rem;
    /*text-align: center;*/
    overflow: hidden;
    cursor: pointer;
  }
  .img-card img{
    margin-top: 0.1rem;
  }
}

@media screen and (min-device-width:768px){
  div.img-card{
    margin: auto auto;
    width: 6.2rem;
    height: 2rem;
    /*text-align: center;*/
    overflow: hidden;
    cursor: pointer;
  }
  .img-card img{
    height: 100%;
  }
}

div.title-container {
  padding: 0;
  width: auto;
  margin-left: .01rem;
  margin-top: 0;
  overflow: hidden;
}

div.my-title{
  margin: 0 0.1rem 0.1rem 0.1rem;
  font-size: 0.3rem;
  text-align: left;
  vertical-align: baseline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.my-title.main-title{
  height: 1.2rem;
}
.my-title.author{
  margin: 0.15rem 0.1rem 0 0.1rem;
  font-size: 0.22rem;
}
.my-title.ctime{
  margin: 0 0.1rem 0 0.1rem;
  font-size: 0.22rem;
}
</style>