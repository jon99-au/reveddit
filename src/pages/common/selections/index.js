import React, { lazy } from 'react'
import {connect} from 'state'
import RemovedFilter from 'pages/common/selections/RemovedFilter'
import RemovedByFilter from 'pages/common/selections/RemovedByFilter'
import CategoryFilter from 'pages/common/selections/CategoryFilter'
import LocalSort from 'pages/common/selections/LocalSort'
import ItemsPerPage from 'pages/common/selections/ItemsPerPage'
import RedditSort from 'pages/common/selections/RedditSort'
import Content from 'pages/common/selections/Content'
import TextFilter from 'pages/common/selections/TextFilter'
import TagsFilter from 'pages/common/selections/TagsFilter'
import ResultsSummary from 'pages/common/ResultsSummary'
import Selfposts from 'pages/common/selections/Selfposts'
import { SimpleURLSearchParams } from 'utils'
import Pagination from 'components/Pagination'

const UpvoteRemovalRateHistory = lazy(() => import('pages/common/selections/UpvoteRemovalRateHistory'))

const paramKey = 'showFilters'


class Selections extends React.Component {
  state = {
    showFilters: false
  }

  componentDidMount () {
    const queryParams = new SimpleURLSearchParams(window.location.search)
    if (queryParams.get(paramKey) === 'true') {
      this.setState({showFilters: true})
    }
  }
  toggleShowFilters = () => {
    const showFilters = ! this.state.showFilters
    const queryParams = new SimpleURLSearchParams(window.location.search)
    if (showFilters) {
      queryParams.set(paramKey, true)
    } else {
      queryParams.delete(paramKey)
    }
    let to = `${window.location.pathname}${queryParams.toString()}`
    window.history.replaceState(null,null,to)
    this.setState({showFilters})
  }
  getShowFiltersText() {
    if (this.state.showFilters) {
      return '[–] hide filters'
    } else {
      return '[+] show filters'
    }
  }
  render () {
    const { subreddit, page_type, visibleItemsWithoutCategoryFilter, num_items, num_showing,
            category_type, category_title, category_unique_field,
          } = this.props
    const { showFilters } = this.state
    let upvoteRemovalRateHistory = '', save_reset_buttons = ''
    if (['subreddit_posts', 'subreddit_comments', 'thread'].includes(page_type)) {
      upvoteRemovalRateHistory = <UpvoteRemovalRateHistory subreddit={subreddit} page_type={page_type}/>
    }
    const categoryFilter = <CategoryFilter page_type={page_type}
      visibleItemsWithoutCategoryFilter={visibleItemsWithoutCategoryFilter}
      type={category_type} title={category_title} unique_field={category_unique_field}/>
    const textFilter = <TextFilter page_type={page_type} />
    if (showFilters) {
      const save = <a className='pointer' onClick={() => this.props.global.saveDefaults(page_type)}>save</a>
      const reset = <a className='pointer' onClick={() => this.props.global.resetDefaults(page_type)}>reset</a>
      save_reset_buttons = <span> | {save} / {reset}</span>
    }

    return (
      <>
        <div className='toggleFilters'>
          <a onClick={this.toggleShowFilters} className='collapseToggle'>{this.getShowFiltersText()}</a>
          {save_reset_buttons}
        </div>
        <div style={{clear:'both'}}></div>
        {showFilters &&
          <div className='selections'>
            {(() => {
              switch(page_type) {
                case 'subreddit_posts':
                case 'domain_posts':
                case 'duplicate_posts':
                case 'info':
                case 'search':
                  return (
                    <>
                      {page_type === 'subreddit_posts' &&
                        <Content page_type={page_type} subreddit={subreddit}/>
                      }
                      {page_type === 'domain_posts' &&
                        <Selfposts page_type={page_type}/>
                      }
                      <LocalSort page_type={page_type}/>
                      <div>
                        <RemovedFilter page_type={page_type} />
                        <ItemsPerPage/>
                      </div>
                      <RemovedByFilter page_type={page_type}/>
                      <TagsFilter page_type={page_type}/>
                      <div>
                        {categoryFilter}
                        {textFilter}
                      </div>
                      {subreddit !== 'all' && page_type === 'subreddit_posts' &&
                        upvoteRemovalRateHistory
                      }
                    </>)
                case 'subreddit_comments':
                case 'missing_comments':
                  return (
                    <>
                      {page_type === 'subreddit_comments' &&
                        <Content page_type={page_type}/>
                      }
                      <LocalSort page_type={page_type}/>
                      <div>
                        <RemovedFilter page_type={page_type} />
                        <ItemsPerPage/>
                      </div>
                      <RemovedByFilter page_type={page_type} />
                      <TagsFilter page_type={page_type}/>
                      <div>
                        {categoryFilter}
                        {textFilter}
                      </div>
                      {subreddit !== 'all' &&
                        upvoteRemovalRateHistory
                      }
                    </>)
                case 'user':
                  return (
                    <>
                      <Content page_type={page_type} />
                      <RedditSort page_type={page_type} />
                      <RemovedFilter page_type={page_type} />
                      <RemovedByFilter page_type={page_type}/>
                      <TagsFilter page_type={page_type}/>
                      <div>
                        {categoryFilter}
                        {textFilter}
                      </div>
                    </>)
                case 'thread':
                  return (
                    <>
                      <LocalSort page_type={page_type} />
                      <RemovedFilter page_type={page_type} />
                      <RemovedByFilter page_type={page_type} />
                      <TagsFilter page_type={page_type}/>
                      {subreddit !== 'all' &&
                        upvoteRemovalRateHistory
                      }
                    </>)
                default: return ''
              }
            })()}
          </div>
        }
        {num_items ?
          <Pagination subreddit={subreddit} page_type={page_type}>
            <ResultsSummary num_showing={num_showing}
                            category_type={category_type}
                            category_unique_field={category_unique_field}
                            page_type={page_type} />
          </Pagination>
          : ''
        }
      </>
    )
  }
}

export default connect(Selections)
