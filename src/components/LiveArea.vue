<script setup lang="ts">
    import {inject} from "vue"
    import {ElLink} from "element-plus"
    import {useStore} from "../vuex"
    import {useAuData, useDownload, useNativeBB, useQnData, useReVideoWindow, useTs2Time} from "../hooks"
    import ContextMenuV3 from "./ContextMenuV3.vue"
    import {ElMessage} from "element-plus/es"
    
    interface TypeLive {
      liveList: any[]
    }
    
    defineProps<TypeLive>()
    
    const store = useStore()
    const state = store.state.live!
    const openVideoWindow = useReVideoWindow
    
    // 可能会有用的自定义右键菜单
    const emitContext = inject('emitContext') as (event: Event, dataId: Record<string, unknown>) => void
    const openContextMenu = (e: any) => {
      emitContext(e, {name: 'context-menu-1', id: [1, 2, 3]})
    // @contextmenu="openContextMenu"
    }
  
    
    const downPic = async (aid: string, pic: string) => {
      await useDownload(aid, pic, store.state.settings?.downloadPicPath, "pic", store.state.settings!.downloadImplIndex)
    }
    
    const tipDownError = (mes: string) => {
      ElMessage({
        type: 'error',
        message: `${mes} 下载失败`,
      })
    }
    
    </script>
    
    <template>
      <ContextMenuV3/>
    
      <el-row :gutter="20">
        <el-col
            v-for="(item, index) in liveList"
            :key="item.room_id"
            :xs="24"
            :sm="8"
            :md="6"
            :lg="4"
            :xl="3"
            :offset="index > 0 ? 0 : 0"
        >
          <el-card :body-style="{ padding: '0px'}" style="margin-top: 10px" shadow="hover">
            <el-image
                :src="item.cover_from_user+'@200w_113h'"
                class="image"
                :preview-src-list="state.srcList"
                :initial-index="index"
                fit="cover"
            />
            <div style="padding: 14px">
              <el-link
                  target="_blank"
                  :underline="false"
                  @click="openVideoWindow([{aid: `live${item.room_id}`, title: item.title}], store.state.scale)">
                <span class="title">{{ item.title }}</span>
              </el-link>
    
              <div class="grid">
                <el-link
                    :underline="false"
                    target="_blank"
                    :href="`https://space.bilibili.com/${item.uid}`"
                    class="up-name">
                  <span class="single-line">{{ item.uname }}</span>
                </el-link>
                <time class="time">{{ useTs2Time(item.live_time) }}</time>
    
                <el-popover
                    placement="top"
                    :width="100"
                    trigger="click"
                >
                  <template #reference>
                    <el-button text circle icon="MoreFilled" class="ext-menu" @click=""></el-button>
                  </template>
    
                  <el-row>
                    <el-link :underline="false" @click="downPic(item.param, item.cover)"><span>下载封面</span>
                    </el-link>
                  </el-row>
                  <el-row>
                    <el-link :href="`https://live.bilibili.com/${item.room_id}`" target="_blank"
                             :underline="false">去网页
                    </el-link>
                  </el-row>
                </el-popover>
    
              </div>
            </div>
    
          </el-card>
        </el-col>
      </el-row>
    </template>
    
    <style scoped lang="less">
    div.grid {
      margin-top: 10px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, 1fr);
      justify-items: start;
      align-items: center;
    }
    
    .up-name {
      grid-column-start: 1;
      grid-column-end: 3;
      padding: 0;
      min-height: auto;
    }
    
    .single-line {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .time {
      grid-column-start: 1;
      grid-column-end: 3;
      font-size: 12px;
      color: #999;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .ext-menu {
      justify-self: end;
      grid-column-start: 3;
      grid-column-end: 4;
      grid-row-start: 1;
      grid-row-end: 3;
    }
    
    .image {
      width: 100%;
      display: block;
    }
    
    .title {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box; //作为弹性伸缩盒子模型显示。
      -webkit-box-orient: vertical; //设置伸缩盒子的子元素排列方式--从上到下垂直排列
      -webkit-line-clamp: 3; //显示的行
    }
    
    div.flex {
      /*flex 布局*/
      display: flex;
      /*实现垂直居中*/
      align-items: center;
      /*实现水平居中*/
      justify-content: center;
      text-align: justify;
      /*width:200px;*/
      /*height:200px;*/
      background: #000;
      margin: 0 auto;
      color: #fff;
    }
    
    .bottom {
      margin-top: 13px;
      line-height: 12px;
      display: flex;
      justify-content: flex-start;
      align-items: start;
      //flex-direction: column;
    }
    
    </style>