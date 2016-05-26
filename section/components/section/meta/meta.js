import React, { Component } from 'react';
import Follow from '../../../../myft/templates/follow';

export default props => <div className="section-meta">
							<h2 className="section-meta__title" dangerouslySetInnerHTML={{ __html: props.title }} />
							{
								props.followButton ?
									<Follow {...props.followButton} /> :
									null
							}
						</div>;
