<template>
  <div class="my-post-archive">
    <taxFilter
      v-if="taxFilterShow"
      :taxFetchUrl="taxFetchUrl"
      :taxFilterSearch="taxFilterSearch"
      :taxQuery="taxQuery"
      :dataOrigin="dataOrigin"
      :paginationShow="paginationShow"
      @changeData="changeDataBase"
      @changeTotal="changeTotalPosts"
    />
    <article class="archive" v-if="datas">
      <section class="archive__item" v-for="data in datas" :key="data.id">
        <slot :data="data" name="post" />
      </section>
    </article>
    <pagination
      v-if="paginationShow"
      ref="pagination"
      :totalPosts="totalPosts"
      :perPage="perPage"
      :pager="pager"
      :pagerVisible="pagerVisible"
      :pagerScroll="pagerScroll"
      @changePage="changePager"
    />
  </div>
</template>

<style lang="scss" scoped>
.archive {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: .5rem 1rem;
  margin-top: 1rem;
  &__item {
    width: calc((100% / 3) - ( 1rem * (3 - 1) ));
    text-align: center;
  }
}
</style>

<script>
  import axios from 'axios'
  import pagination from './pagination.vue'
  import taxFilter from './taxFilter.vue'

  export default {
    props: {
      postFetchUrl: {
        type: String,
        require: true
      },
      postQuery: {
        type: Object,
        default: () => ({
          '_fields':  'id,content,title,categories,_links,_embedded',
          '_embed':   '',  // アイキャッチ情報の取得
        })
      },
      perPage: {
        type: Number,
        default: 10,
      },
      /* pagination ------------------------------------------------- */
        pagerVisible: {
          type: Number,
          default: 5,       // pagerの表示数
        },
        pagerScroll: {
          type: Number,
          default: 1,       // next, prevをクリックした際の表示ページ
        },
        paginationShow: {
          type:    Boolean,
          default: true,
        },

      /* taxFilter ------------------------------------------------- */
        taxFetchUrl: {
          type: String,
          default: '/wp-json/wp/v2/categories',
        },
        taxFilterShow: {
          type: Boolean,
          default: true,
        },
        taxFilterSearch: {
          type: String,
          default: 'or',  // 'or' or 'and'
        },
        taxQuery: {
          type: Object,
          default: () => ({
            'exclude':   1,  // 未分類の非取得
          })
        },
    },
    data() {
      return {
        dataOrigin:    [],
        dataBase:      [],
        totalPages:    0,
        totalPosts:    0,
        pager:         1,
      }
    },
    components: {
      pagination,
      taxFilter
    },
    mounted() {
      this.getPostDatas()
    },
    methods: {

      /* post archive ------------------------------------------------- */

        // 投稿の取得
        async getPostData(num, postQuery = this.postQuery) {
          // パラメーターを追加できるようにしておく
            let insertParams = []
            // pagerもしくはtaxFilterを表示する場合
            const params   = { page: num }
            insertParams = await {...postQuery, ...params}
          await axios.get(this.postFetchUrl, {params: insertParams})
            .then((res) => {
              this.dataOrigin = this.dataOrigin.concat(res.data)
              this.dataBase   = this.dataOrigin
            })
            .catch(error => console.log(error))
        },

        // 投稿の初期情報取得
        async getPostInfo() {
          await axios.get(this.postFetchUrl)
            .then((res) => {
              this.totalPages = Number(res.headers['x-wp-totalpages'])  // 合計ページ数
              this.totalPosts = Number(res.headers['x-wp-total'])       // 合計投稿数
            })
            .catch(error => console.log(error))
        },

        // 投稿を全件取得
        async getPostDatas() {
          if(this.paginationShow === true || this.taxFilterShow === true) {
            await this.getPostInfo()
            // paginationを表示する場合
            if(this.paginationShow) this.$refs.pagination.pagerDefault()
            const numPostAry = [...Array(this.totalPages).keys()].map( i => ++i )
            for (let num of numPostAry) {
              await this.getPostData(num)
            }
          } else {
            // pagerもしくはtaxFilterを表示しない場合
            await this.getPostData(false)
          }
        },

      /* pagination ------------------------------------------------- */

        // 子コンポーネント：pagerの受け取り
        changePager(num) {
          this.pager = num
        },

      /* taxFilter ------------------------------------------------- */

        // 子コンポーネント：dataBaseの受け取り
        changeDataBase(datas) {
          this.dataBase = datas
        },

        // 子コンポーネント：totalPostsの受け取り
        changeTotalPosts(num) {
          this.totalPosts = num
        },
    },
    computed: {

      // 表示dataの取得
      datas() {
        if(this.paginationShow !== false) {
          // paginationを表示する場合
          const start = (this.pager - 1) * this.perPage
          const end   = start + this.perPage
          return this.dataBase.slice(start, end)
        } else {
          // paginationを表示しない場合
          return this.dataBase
        }
      },

    },
  }
</script>
