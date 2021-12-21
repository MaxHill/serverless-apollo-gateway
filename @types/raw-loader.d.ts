declare module '*.graphql' {
  import { DocumentNode } from 'graphql';
  const Schema: DocumentNode;

  export = Schema;
}

declare module '*.gql' {
  import { DocumentNode } from 'graphql';
  const Schema: DocumentNode;

  export = Schema;
}

declare module '*.txt' {
  const content: string;
  export default content;
}

declare module '*.yaml' {
  const data: string;
  export default data;
}

declare module '*.yml' {
  const data: string;
  export default data;
}
