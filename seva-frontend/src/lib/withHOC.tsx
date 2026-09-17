import React, { ComponentType, ReactNode } from 'react';

export default function withHOC<P extends object>(
  Provider: ComponentType<{ children: ReactNode } & any>,
  Component: ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    return (
      <Provider {...props}>
        <Component {...props} />
      </Provider>
    );
  };
}