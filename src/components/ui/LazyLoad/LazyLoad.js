// Fork of https://github.com/loktar00/react-lazy-load
import React, { Children, Component } from 'react';

import PropTypes from 'prop-types';

import debounce from './utils/debounce';
import throttle from './utils/throttle';
import parentScroll from './utils/parentScroll';
import inViewport from './utils/inViewport';

import style from './LazyLoad.module.css';

export default class LazyLoad extends Component {
  constructor(props) {
    super(props);

    this.lazyLoadHandler = this.lazyLoadHandler.bind(this);

    this.componentRef = React.createRef();

    if (props.throttle > 0) {
      if (props.debounce) {
        this.lazyLoadHandler = debounce(this.lazyLoadHandler, props.throttle);
      } else {
        this.lazyLoadHandler = throttle(this.lazyLoadHandler, props.throttle);
      }
    }

    this.state = { visible: false };
  }

  componentDidMount() {
    this._mounted = true;
    const eventNode = this.getEventNode();

    this.lazyLoadHandler();

    if (this.lazyLoadHandler.flush) {
      this.lazyLoadHandler.flush();
    }

    window.addEventListener('resize', this.lazyLoadHandler);
    eventNode.addEventListener('scroll', this.lazyLoadHandler);

    if (eventNode !== window) {
        window.addEventListener('scroll', this.lazyLoadHandler);
    }
  }

  componentDidUpdate() {
    if (!this.state.visible) {
      this.lazyLoadHandler();
    }
  }

  shouldComponentUpdate(_nextProps, nextState) {
    return nextState.visible;
  }

  componentWillUnmount() {
    this._mounted = false;
    if (this.lazyLoadHandler.cancel) {
      this.lazyLoadHandler.cancel();
    }

    this.detachListeners();
  }

  getEventNode() {
    return parentScroll(this.componentRef.current);
  }

  getOffset() {
    const {
      offset, offsetVertical, offsetHorizontal,
      offsetTop, offsetBottom, offsetLeft, offsetRight, threshold,
    } = this.props;

    const _offsetAll = threshold || offset;
    const _offsetVertical = offsetVertical || _offsetAll;
    const _offsetHorizontal = offsetHorizontal || _offsetAll;

    return {
      top: offsetTop || _offsetVertical,
      bottom: offsetBottom || _offsetVertical,
      left: offsetLeft || _offsetHorizontal,
      right: offsetRight || _offsetHorizontal,
    };
  }

  lazyLoadHandler() {
    if (!this._mounted) {
      return;
    }
    const offset = this.getOffset();
    const node = this.componentRef.current; 
    const eventNode = this.getEventNode();

    if (inViewport(node, eventNode, offset)) {
      const { onContentVisible } = this.props;

      this.setState({ visible: true }, () => {
        if (onContentVisible) {
          onContentVisible();
        }
      });
      this.detachListeners();
    }
  }

  detachListeners() {
    const eventNode = this.getEventNode();

    window.removeEventListener('resize', this.lazyLoadHandler);
    eventNode.removeEventListener( 'scroll', this.lazyLoadHandler);

    if (eventNode !== window) {
        window.removeEventListener('scroll', this.lazyLoadHandler);
    }
  }

  render() {
    const { children, className, height, width } = this.props;
    const { visible } = this.state;

    const elStyles = { height, width };
    const elClasses = `${style.container} ${visible ? style.is_visible : ''} ${className ?  className : ''} `;

    return React.createElement(this.props.elementType, {
      className: elClasses,
      style: elStyles, 
      ref : this.componentRef,
    }, visible && Children.only(children));
  }
}

LazyLoad.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  debounce: PropTypes.bool,
  elementType: PropTypes.string,
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  offset: PropTypes.number,
  offsetBottom: PropTypes.number,
  offsetHorizontal: PropTypes.number,
  offsetLeft: PropTypes.number,
  offsetRight: PropTypes.number,
  offsetTop: PropTypes.number,
  offsetVertical: PropTypes.number,
  threshold: PropTypes.number,
  throttle: PropTypes.number,
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  onContentVisible: PropTypes.func,
};

LazyLoad.defaultProps = {
  elementType: 'figure',
  debounce: true,
  offset: 0,
  offsetBottom: 0,
  offsetHorizontal: 0,
  offsetLeft: 0,
  offsetRight: 0,
  offsetTop: 0,
  offsetVertical: 0,
  throttle: 20, //250
};