import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';

import { FiUser, FiCalendar, FiClock } from "react-icons/fi";

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
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
interface PostPagination {
  results: { uid?: string; }[];
}

export default function Post({ post }: PostProps) {
  const router = useRouter()
  const tempoDeLeitura = () => {
    const palavras = post?.data.content.reduce((acc, cur) => {
      const headingSize = cur.heading.split(/[ ,]+/).length
      const bodySize = RichText.asText(cur.body).split(/[ ,]+/).length
      return acc + headingSize + bodySize
    }, 0)
    const mediaDePalavrasPorMinuto = 200
    return Math.ceil(palavras / mediaDePalavrasPorMinuto)
  }

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <Head>
        <title> Post | Title</title>
      </Head>
      <main className={styles.container}>
        <img src={post?.data.banner.url}></img>
        <article className={commonStyles.postContainer}>
          <h1 className={styles.heading}>{post?.data.title}</h1>
          <div className={commonStyles.details}>
            <div className={commonStyles.info}>
              <FiCalendar />
              <time>{format(
                new Date(post?.first_publication_date),
                "dd MMM yyyy",
                {
                  locale: ptBR,
                }
              )}</time>
            </div>
            <div className={commonStyles.info}>
              <FiUser />
              <span>{post?.data.author}</span>
            </div>
            <div className={commonStyles.info}>
              <FiClock />
              <span>{tempoDeLeitura()} min</span>
            </div>
          </div>

          {post?.data.content.map(content => (
            <div className={styles.postContent} key={content.heading}>
              <h2 className={styles.postHeading}>{content.heading}</h2>
              <div
                className={styles.postContentBody}
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </div>
          ))}
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse: PostPagination = await prismic.query(
    [
      Prismic.predicates.at('document.type', 'posts')
    ],
    {
      fetch: ['posts.uid']
    }
  );

  return {
    paths: postsResponse?.results?.map(post => ({ params: { slug: post.uid } })),
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response?.data?.title,
      subtitle: response?.data?.subtitle,
      banner: {
        url: response?.data?.banner?.url
      },
      author: response?.data?.author,
      content: response?.data?.content,
    }
  }

  return {
    props: {
      post
    },
    redirect: 60 * 10, // 10 minutos
    revalidate: 1
  }
};

