<script setup lang="ts">

const refresh = () => {
  alert('刷新')
}

const itemClickEvent = (e: any) => {
  console.log('停止，自定义id:' + e.id)
}

</script>

<template>
  <context-menu name="context-menu-1">
    <context-menu-submenu :label="'查看'">
      <context-menu-item disabled>图标</context-menu-item>
      <context-menu-item>列表</context-menu-item>
      <context-menu-item>详细信息</context-menu-item>
    </context-menu-submenu>
    <context-menu-submenu :label="'排序方式'">
      <context-menu-item>名称</context-menu-item>
      <context-menu-item>日期</context-menu-item>
      <context-menu-item>类型</context-menu-item>
      <context-menu-item>大小</context-menu-item>
      <context-menu-item disabled>时长</context-menu-item>
    </context-menu-submenu>
    <context-menu-item @click="refresh" :divider="true">刷新</context-menu-item>
    <context-menu-item @itemClickHandle="itemClickEvent" :divider="true">停止</context-menu-item>
    <context-menu-submenu :label="'自定义'" divider>
      <context-menu-item>二级菜单</context-menu-item>
      <context-menu-submenu :label="'多级菜单'">
        <context-menu-item>三级菜单</context-menu-item>
        <context-menu-item>嵌套菜单</context-menu-item>
      </context-menu-submenu>
    </context-menu-submenu>
    <context-menu-submenu :label="'新建'" divider>
      <context-menu-item>新建文件</context-menu-item>
      <context-menu-item>新建文件夹</context-menu-item>
      <context-menu-item>快捷方式</context-menu-item>
    </context-menu-submenu>
    <context-menu-item :disabled="true">属性</context-menu-item>
  </context-menu>
</template>

<style scoped>

</style>