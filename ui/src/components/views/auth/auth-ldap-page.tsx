import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon20MailOutline, Icon20UserOutline } from '@vkontakte/icons'
import { Button, Div, FormItem, FormLayoutGroup, FormStatus, Group, Input, Panel, Spacing, View } from '@vkontakte/vkui'

import { DynamicLogo } from '@/components/lib/dynamic-logo'
import { ConditionalRender } from '@/components/lib/conditional-render'

import { authStore } from '@/store/auth-store'
import { useLdapAuth } from '@/lib/hooks/use-ldap-auth.hook'
import { useGetAuthContact } from '@/lib/hooks/use-get-auth-contact.hook'

import styles from './auth-page.module.css'

import type { FormEvent } from 'react'

export const AuthLdapPage = () => {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formError, setFormError] = useState('')
  const { data: authData, error, mutate: auth, isSuccess } = useLdapAuth()
  const { data: authContact } = useGetAuthContact()

  const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    auth({ username, password })
  }

  useEffect(() => {
    if (isSuccess) {
      authStore.login(authData.jwt)
      window.location.assign(authData.redirect)
    }
  }, [authData])

  useEffect(() => {
    if (error?.response?.data.error === 'ValidationError') {
      for (const item of error.response.data.validationErrors) {
        if (item.param === 'username') {
          setUsernameError(item.msg)
        }

        if (item.param === 'password') {
          setPasswordError(item.msg)
        }
      }

      return
    }

    if (error?.response?.data.error === 'InvalidCredentialsError') {
      setFormError('Incorrect login details')

      return
    }

    if (error?.response?.data.error) {
      setFormError('We do not recognize you. Please check your spelling and try again or use another login option')
    }
  }, [error])

  return (
    <View activePanel='main'>
      <Panel id='main' centered>
        <Group className={styles.authPage} separator='hide'>
          <div>
            <form className={styles.form} onSubmit={onFormSubmit}>
              <DynamicLogo className={styles.logo} height={55} width={225} />
              <FormLayoutGroup>
                <FormItem bottom={usernameError} status={usernameError ? 'error' : undefined} top={t('Username')}>
                  <Input
                    before={<Icon20UserOutline />}
                    placeholder='Please enter your Single Sign-On login'
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </FormItem>
                <FormItem bottom={passwordError} status={passwordError ? 'error' : undefined} top={t('Password')}>
                  <Input
                    before={<Icon20MailOutline />}
                    placeholder='Please enter your Single Sign-On password'
                    type='email'
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </FormItem>
                <Spacing size='xl' />
                <FormItem>
                  <Button disabled={!username || !password} size='l' type='submit' stretched>
                    {t('Log In')}
                  </Button>
                </FormItem>
              </FormLayoutGroup>
              <ConditionalRender conditions={[!!formError]}>
                <Div>
                  <FormStatus mode='error'>{formError}</FormStatus>
                </Div>
              </ConditionalRender>
              <Button className={styles.contactButton} href={authContact} mode='link'>
                {t('Contact Support')}
              </Button>
            </form>
          </div>
        </Group>
      </Panel>
    </View>
  )
}
