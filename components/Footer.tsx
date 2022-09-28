import * as React from 'react'
import { useHover } from "usehooks-ts";

import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter'
import { FaZhihu } from '@react-icons/all-files/fa/FaZhihu'
import { FaGithub } from '@react-icons/all-files/fa/FaGithub'
import { FaLinkedin } from '@react-icons/all-files/fa/FaLinkedin'
import { FaEnvelopeOpenText } from '@react-icons/all-files/fa/FaEnvelopeOpenText'
import { FaYoutube } from '@react-icons/all-files/fa/FaYoutube'
import { IoSunnyOutline } from '@react-icons/all-files/io5/IoSunnyOutline'
import { IoMoonSharp } from '@react-icons/all-files/io5/IoMoonSharp'

import { useDarkMode } from 'lib/use-dark-mode'
import * as config from 'lib/config'

import styles from './styles.module.css'
import { layoutDefaultClasses } from './styles';

// TODO: merge the data and icons from PageSocial with the social links in Foote 

// based on dotdev/default.html #footer element

const classes = layoutDefaultClasses

export const FooterImpl: React.FC<any> = ({ page, isBlogPost }) => {
  const shareHoverRef = React.useRef(null);
  const shareIsHovered = useHover(shareHoverRef);
  const settingsHoverRef = React.useRef(null);
  const settingsIsHovered = useHover(settingsHoverRef);

  const { toggleDarkMode } = useDarkMode();

  return (
    <footer ref={shareHoverRef} id="footer" className={classes.footer}>
      <div id="social-block" className={classes.socialBlock}>
        <span id="twitter-link" className={classes.socialBlockAction}>
          <a className="link" href="https://twitter.com/suruleredotdev">
            @SURULEREDOTDEV
          </a>
        </span>
        {isBlogPost ? (
          <div
            id="share-block"
            className={classes.shareBlock}
            style={{ bottom: "0", left: "calc(2.6 * var(--bg-size))" }}
          >
            {shareIsHovered ? (
              <>
                <span className={classes.shareBlockAction}>
                  <a
                    target="_blank"
                    className="no-ul"
                    href={
                      "https://twitter.com/intent/tweet?text=" +
                      encodeURIComponent(
                        `${page.title} https://surulere.dev ${page.url}`
                      )
                    }
                    rel="noreferrer"
                  >
                    TWITTER
                  </a>
                </span>
                <span className={classes.shareBlockAction}>
                  <a
                    target="_blank"
                    className="no-ul"
                    href={
                      "https://www.facebook.com/sharer/sharer.php?u=" +
                      encodeURIComponent(
                        `${page.title} https://surulere.dev ${page.url}`
                      )
                    }
                    rel="noreferrer"
                  >
                    FACEBOOK
                  </a>
                </span>
              </>
            ) : (
              <></>
            )}
            <span className={classes.shareBlockDropdown}>
              <a href="#" className="no-ul">
                SHARE
              </a>
            </span>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div
        ref={settingsHoverRef}
        id="settings-block"
        className={classes.settingsBlock}
        style={{ bottom: "0", right: "0" }}
      >
        {settingsIsHovered ? (
          <>
            <span
              id="clear-local-storage"
              className={classes.settingsBlockAction}
              onClick={() => {
                window.localStorage.clear();
                console.log("[suruleredotdev]: local storage cleared!");
              }}
            >
              CLEAR LOCAL STORAGE
            </span>
            <span
              id="dark-mode-toggle"
              className={classes.settingsBlockAction}
              onClick={toggleDarkMode}
            >
              TOGGLE DARK MODE
            </span>
          </>
        ) : (
          <></>
        )}
        <script></script>

        <span className={classes.settingsBlockDropdown}>
          <a href="#" className="no-ul">
            SETTINGS
          </a>
        </span>
      </div>
    </footer>
  );
};

export const Footer = React.memo(FooterImpl)

export const OldFooterImpl: React.FC = () => {
  const [hasMounted, setHasMounted] = React.useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const onToggleDarkMode = React.useCallback(
    (e) => {
      e.preventDefault()
      toggleDarkMode()
    },
    [toggleDarkMode]
  )

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <footer className={styles.footer}>
      <div className={styles.copyright}>Copyright 2022 {config.author}</div>

      <div className={styles.settings}>
        {hasMounted && (
          <a
            className={styles.toggleDarkMode}
            href='#'
            role='button'
            onClick={onToggleDarkMode}
            title='Toggle dark mode'
          >
            {isDarkMode ? <IoMoonSharp /> : <IoSunnyOutline />}
          </a>
        )}
      </div>

      <div className={styles.social}>
        {config.twitter && (
          <a
            className={styles.twitter}
            href={`https://twitter.com/${config.twitter}`}
            title={`Twitter @${config.twitter}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <FaTwitter />
          </a>
        )}

        {config.zhihu && (
          <a
            className={styles.zhihu}
            href={`https://zhihu.com/people/${config.zhihu}`}
            title={`Zhihu @${config.zhihu}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <FaZhihu />
          </a>
        )}

        {config.github && (
          <a
            className={styles.github}
            href={`https://github.com/${config.github}`}
            title={`GitHub @${config.github}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <FaGithub />
          </a>
        )}

        {config.linkedin && (
          <a
            className={styles.linkedin}
            href={`https://www.linkedin.com/in/${config.linkedin}`}
            title={`LinkedIn ${config.author}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <FaLinkedin />
          </a>
        )}

        {config.newsletter && (
          <a
            className={styles.newsletter}
            href={`${config.newsletter}`}
            title={`Newsletter ${config.author}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <FaEnvelopeOpenText />
          </a>
        )}

        {config.youtube && (
          <a
            className={styles.youtube}
            href={`https://www.youtube.com/${config.youtube}`}
            title={`YouTube ${config.author}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <FaYoutube />
          </a>
        )}
      </div>
    </footer>
  )
}
