<template>
  <div class="filter">
    <div class="filter__label" v-for="term in dataTerms" :key="term.id">
      <input type="checkbox" :id="`term_${term.id}`" v-model="terms" :value="term.id">
      <label :for="`term_${term.id}`" v-text="`${term.name}(${term.count})`" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filter {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: .5rem 1rem;
  border-bottom: 2px solid #eee;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
}
</style>

<script>
  import axios from 'axios'
  export default {
    props: {
      taxFetchUrl: {
        type: String,
      },
      taxFilterSearch: {
        type: String,
      },
      taxQuery: {
        type: Object,
      },
      dataOrigin: {
        type: Array,
      },
      paginationShow: {
        type: Boolean,
      },
    },
    data() {
      return {
        terms:    [],
        dataTerms:       [],
        totalTaxPages: 0,
      }
    },
    mounted() {
      this.getTermDatas()
    },
    methods: {

      // タームの取得
      async getTermData(num, taxQuery = this.taxQuery) {
        // パラメーターを追加できるようにしておく
        const params   = { page: num }
        const insertParams = await {...taxQuery, ...params}
        await axios.get(this.taxFetchUrl, {params: insertParams})
          .then((res) => {
            // タームの情報をdataTermsに結合
            this.dataTerms = this.dataTerms.concat(res.data)
          })
          .catch(error => console.log(error))
      },

      // タクソノミーの初期情報取得
      async getTaxInfo() {
        await axios.get(this.taxFetchUrl)
          .then((res) => {
            this.totalTaxPages = Number(res.headers['x-wp-totalpages'])  // 合計ページ数
          })
          .catch(error => console.log(error))
      },

      // タームを全件取得
      async getTermDatas() {
        // タクソノミー情報の取得
        await this.getTaxInfo()
        // タームの全件取得
        const numTaxAry = [...Array(this.totalTaxPages).keys()].map( i => ++i )
        for (let num of numTaxAry) {
          await this.getTermData(num)
        }
      },

      // タクソノミーフィルター
      async postTaxFilter() {
        let datas = []
        // termsが指定されていない場合（チェックを外した場合など）
        if(!this.terms.length){
          // 全データをdataBaseに格納
          datas = await this.dataOrigin
        // タームが指定されている場合
        } else {
          // or検索の場合
          if(this.taxFilterSearch == 'or') {
            // フィルターで該当タームに属する投稿をdataBaseに格納
            datas = await this.dataOrigin.filter((obj)=>{
              return this.terms.some(id => obj[this.taxName].includes(id))
            })
          // and検索の場合
          } else {
            // フィルターで該当タームに属する投稿をdataBaseに格納
            datas = await this.dataOrigin.filter((obj)=>{
              return this.terms.every(id => obj[this.taxName].includes(id))
            })
          }
        }
        // dataBaseの更新
        this.$emit('changeData', datas)
        // totalPostsの更新
        this.$emit('changeTotal', datas.length)
      },
    },
    computed: {
      taxName() {
        return this.taxFetchUrl.match(/.*\/([\w|~]+).*$/u)[1]
      },
    },
    watch: {

      // タクソノミー変更時の挙動
      async terms() {
        // フィルターかける
        await this.postTaxFilter()
        // paginationを表示しない場合はスルー
        if(this.paginationShow) this.$parent.$refs.pagination.pagerDefault()
      },

    }
  }
</script>
