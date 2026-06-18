"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { isAxiosError } from "axios"

import { api } from "@/lib/api"
import { getApiBaseUrl } from "@/lib/backend-url"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await api.post("/auth/sign-up", {
        firstName,
        lastName: lastName.trim() || null,
        email,
        password,
      })
      router.push("/dashboard")
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Signup failed")
      } else {
        setError("Signup failed")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="firstname">First Name</FieldLabel>
              <Input
                id="firstname"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="lastname">Last Name</FieldLabel>
              <Input
                id="lastname"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <FieldDescription>
                Must be at least 6 characters long.
              </FieldDescription>
            </Field>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    window.location.href = `${getApiBaseUrl()}/auth/google`
                  }}
                >
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="/login">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
