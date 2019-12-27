import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'state'
import 'js-detect-incognito-private-browsing'
import { get, put } from 'utils'

const getEntityName = (params) => {
  const { user, subreddit = '', userSubreddit = '', domain = ''} = params
  return (user || subreddit || userSubreddit || domain).toLowerCase()
}

class Header extends React.Component {
  state = {
    entity_name: ''
  }
  componentDidMount() {
    const entity_name = getEntityName(this.props.match.params)
    this.setState({entity_name})
    const bmd = window.BrowsingModeDetector()
    const hasVisitedSite = 'hasVisitedSite'
    bmd.do((isIncognito, bmdI) => {
      if (! isIncognito && ! get('hasNotifierExtension', false) && ! get(hasVisitedSite, false)
          && document.cookie.replace(/(?:(?:^|.*;\s*)hasVisitedSite\s*\=\s*([^;]*).*$)|^.*$/, "$1") !== "true"
          && ! document.referrer.match(/^https?:\/\/archive/)) {
        this.welcome()
      }
      put(hasVisitedSite, true)
      document.cookie = `${hasVisitedSite}=true; expires=Fri, 31 Dec 2036 23:59:59 GMT; path=/;`;
    })
  }
  componentDidUpdate(prevProps) {
    const entity_name = getEntityName(this.props.match.params)
    const prev_entity_name = getEntityName(prevProps.match.params)
    if (entity_name !== prev_entity_name) {
      this.setState({entity_name})
    }
  }
  getForm(value, display, path_type, item_type, path_suffix, opposite=false) {
    let text_input_actions = {}
    let form_attributes = { className: `opposite ${path_type}` }
    if (! opposite) {
      form_attributes = {className: path_type}
      text_input_actions = {
        onClick: (e) => this.onClick(e, value),
        onBlur: (e) =>  this.onBlur(e, value),
        value: this.state.entity_name,
        onChange: this.handleNameChange
      }
    }

    return (
      <form {...form_attributes} onSubmit={(e) => this.handleSubmit(e, value)}>
        <span className='subheading'>{display}</span>
        <input type='text' {...text_input_actions}
        name={path_type} placeholder={item_type}/>
        {path_suffix &&
          <span className='subheading'>{`/${path_suffix}/`}</span>
        }
        <input className='desktop-only' type='submit' id='button' value='go' />
      </form>
    )
  }

  handleSubmit = (e, defaultValue) => {
    e.preventDefault()
    const data = new FormData(e.target)
    const pair = Array.from(data.entries())[0]
    const key = pair[0], val = pair[1].trim().toLowerCase()
    if (val !== '' && (this.props.page_type === 'thread' || val !== defaultValue)) {
      this.setState({entity_name: val})
      window.location.href = `/${key}/${val}`
    }
  }
  onClick = (e, defaultValue) => {
    const val = e.target.value.trim().toLowerCase()
    if (val === defaultValue) {
      e.target.value = ''
    }
  }
  onBlur = (e, defaultValue) => {
    const val = e.target.value.trim().toLowerCase()
    if (val === '') {
      e.target.value = defaultValue
    }
  }
  handleNameChange = (e) => {
    this.setState({entity_name: e.target.value})
  }
  welcome = () => {
    this.props.openGenericModal({hash: 'welcome'})
  }
  render() {
    const props = this.props
    const { page_type } = props
    let { user, subreddit = '', userSubreddit = '', domain = ''} = props.match.params
    if (userSubreddit) {
      subreddit = 'u_'+userSubreddit
    }
    let path_type = '', value = '', path_suffix = '', item_type = ''
    if (['subreddit_posts','thread'].includes(page_type)) {
      path_type = 'r'
      value = subreddit
      item_type = 'subreddit'
    } else if (page_type === 'subreddit_comments') {
      path_type = 'r'
      value = subreddit
      path_suffix = 'comments'
      item_type = 'subreddit'
    } else if (user) {
      path_type = 'user'
      value = user
      item_type = 'username'
    } else if (domain) {
      path_type = 'domain'
      value = domain
      item_type = 'domain'
    }
    value = value.toLowerCase()
    let display = `/${path_type}/`

    return (
      <React.Fragment>
        <header>
          <div id='header'>
            <div id='site-name'>re<span style={{color: 'white'}}>ve</span>ddit</div>
            <div id='nav'>
              <Link to="/about">about</Link>
              <span> | </span>
              <a href="#welcome" onClick={this.welcome}>welcome</a>
            </div>
            {value &&
              <div id='subheading'>
                {this.getForm(value, display, path_type, item_type, path_suffix, false)}
              </div>
            }
          </div>
          <div id='status'>
            {props.global.state.statusText &&
            <p id='status-text'>{props.global.state.statusText}</p>}
            {props.global.state.statusImage &&
            <img id='status-image' src={props.global.state.statusImage} alt='status' />}
          </div>
        </header>
      </React.Fragment>
    )
  }
}

export default connect(Header)
