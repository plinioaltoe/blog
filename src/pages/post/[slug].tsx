import { GetStaticPaths, GetStaticProps } from 'next';

import { FiUser, FiCalendar, FiClock } from "react-icons/fi";

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

export default function Post({ post }: PostProps) {

  const tempoDeLeitura = () => {
    const palavras = post.data.content.reduce((acc, cur) => {
      const headingSize = cur.heading.split(/[ ,]+/).length
      const bodySize = RichText.asText(cur.body).split(/[ ,]+/).length
      return acc + headingSize + bodySize
    }, 0)
    const mediaDePalavrasPorMinuto = 200
    return Math.round(palavras / mediaDePalavrasPorMinuto)
  }
console.log(post.data.content)
  return (
    <main className={styles.container}>
      <img src={post.data.banner.url}></img>
      <article className={commonStyles.postContainer}>
        <h1 className={styles.heading}>{post.data.title}</h1>
        <div className={commonStyles.details}>
          <div className={commonStyles.info}>
            <FiCalendar />
            <time>{post.first_publication_date}</time>
          </div>
          <div className={commonStyles.info}>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div className={commonStyles.info}>
            <FiClock />
            <span>{tempoDeLeitura()} min</span>
          </div>
        </div>

        {post.data.content.map(content => (
          <div key={content.heading}>
            <h2>{content.heading}</h2>
            <div
              className={`${styles.postContent}`}
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            />
          </div>
        ))}
      </article>
    </main>
  )
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
      title: response?.data?.title,
      banner: {
        url: response.data?.banner?.url
      },
      author: response.data?.author,
      content: response.data?.content,
    }
  }

  return {
    props: {
      post
    }
  }
};

