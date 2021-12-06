import { GetStaticPaths, GetStaticProps } from 'next';


import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }) {
  console.log((post))
  return (<div>{post.data.content.heading}</div>)
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});
  console.log((response?.data?.title))

  const post = {
    slug,
    first_publication_date: format(
      new Date(response.first_publication_date),
      "dd MMM yyyy",
      {
        locale: ptBR,
      }
    ),
    data: {
      title: (response?.data?.title),
      banner: {
        url: response.data?.banner?.url
      },
      author: (response.data?.author),
      content: response.data?.content.map(c => ({
        heading: c?.heading,
        body: { text: RichText.asHtml(c?.body) },
      }))
    }
  }

  console.log(post)

  return {
    props: {
      post
    }
  }
};

