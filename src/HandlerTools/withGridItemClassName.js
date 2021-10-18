
const withGridItemClassName = (component,bigClassName='',smallClassName='') => {
	component.defaultProps = {...component.defaultProps, RGLParentClassName:bigClassName, RGLChildClassName: smallClassName}
	return component
}

export default withGridItemClassName