<template>
  <div class="pagination" v-if="maxPage">
    <ul class="pagination__list">
      <li class="pagination__item">
        <span class="pagination__item--perv" :class="{ 'pagination__item--hidden' : hidePrev()}" @click="goPrev()">prev</span>
      </li>
      <li class="pagination__item" v-for="num of showPage" :key="num">
        <span v-text="num" class="pagination__item--num" :class="{ 'pagination__item--current' : num == pager}" @click="sendPager(num)" />
      </li>
      <li class="pagination__item">
        <span class="pagination__item--next" :class="{ 'pagination__item--hidden' : hideNext()}" @click="goNext()">next</span>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>

.pagination {
  border-top: 2px solid #eee;
  margin-top: 1rem;
  padding-top: 1rem;
  &__list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: .5rem 1rem;
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  &__item {
    span {
      display: inline-block;
      text-align: center;
      cursor: pointer;
    }
    &--num {
      width: 2rem;
    }
    &--current {
      color: #f00;
    }
    &--hidden {
      visibility: hidden;
    }
    &--perv,
    &--next {
      width: auto;
    }
  }
}


</style>

<script>
  export default {
    props: {
      totalPosts: {
        type: Number,
      },
      perPage: {
        type: Number,
      },
      pager: {
        type: Number,
      },
      pagerVisible: {
        type: Number,
      },
      pagerScroll: {
        type: Number,
      },
    },
    data() {
      return {
        showPage: [],
      }
    },
    methods: {

        // ページの初期表示
        pagerDefault() {
          this.sendPager(1)
          if(this.maxPage <= this.pagerVisible) {
            this.showPage = [...Array(this.maxPage).keys()].map( i => ++i)
          } else {
            this.showPage = [...Array(this.pagerVisible).keys()].map( i => ++i)
          }
        },

        // nextの挙動
        goNext() {
          // 最大ページ数の配列化
          const maxPageAry  = [...Array(this.maxPage).keys()].map( i => ++i)
          // 現状表示されているpagerの最大値取得
          const showPageMax = this.showPage.slice(-1)[0]
          // next時の最終の値を取得
          let end           = showPageMax + this.pagerScroll
          // 最終値と最大ページ数を比較して最初の値を修正
          end               = end > this.maxPage ? this.maxPage : end
          const start       = end - this.pagerVisible
          // 表示に反映
          this.showPage     = maxPageAry.slice(start, end)
          this.sendPager(start + 1)
        },

        // nextの不要判定
        hideNext() {
          return this.showPage.slice(-1)[0] == this.maxPage
        },

        // prevの挙動
        goPrev() {
          // 最大ページ数の配列化
          const maxPageAry  = [...Array(this.maxPage).keys()].map( i => ++i)
          // 現状表示されているpagerの最小値取得
          const showPageMin = this.showPage.slice(0)[0]
          // prev時の最初の値を取得
          let start  = showPageMin - this.pagerScroll - 1
          // 最小値とstartの値を比較して最初の値を修正
          start      = 0 >= start ? 0 : start
          const end  = start + this.pagerVisible
          // 表示に反映
          this.showPage  = maxPageAry.slice(start, end)
          this.sendPager(end)
        },

        // prevの不要判定
        hidePrev() {
          return this.showPage.slice(0)[0] == 1
        },

        // 親コンポーネント：pagerの送信
        sendPager(num) {
          this.$emit('changePage', num)
        }

    },
    computed: {
      // perPageから換算した場合の最大ページ数を取得
      maxPage() {
        return Math.ceil(this.totalPosts / this.perPage)
      },
    }
  }
</script>
