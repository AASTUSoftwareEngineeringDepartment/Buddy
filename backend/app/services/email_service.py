from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from app.config.settings import get_settings

settings = get_settings()

email_config = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_USERNAME,  # Must be a valid email address
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

class EmailService:
    def __init__(self):
        self.fastmail = FastMail(email_config)

    async def send_otp_email(self, email: EmailStr, otp: str):
        """Send OTP email to the user."""
        message = MessageSchema(
            subject="Your OTP for Buddy Registration",
            recipients=[email],
            body=f"""
            <h2>Welcome to Buddy!</h2>
            <p>Your OTP for registration is: <strong>{otp}</strong></p>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            """,
            subtype="html"
        )
        await self.fastmail.send_message(message)

    async def send_child_credentials_email(
        self,
        parent_email: EmailStr,
        child_first_name: str,
        child_last_name: str,
        username: str,
        password: str
    ):
        """Send child account credentials to parent."""
        message = MessageSchema(
            subject="Your Child's Buddy Account Has Been Created",
            recipients=[parent_email],
            body=f"""
            <h2>Congratulations!</h2>
            <p>Your child's Buddy account has been successfully created.</p>
            <p><strong>Child's Name:</strong> {child_first_name} {child_last_name}</p>
            <p><strong>Username:</strong> {username}</p>
            <p><strong>Password:</strong> {password}</p>
            <p>Please keep these credentials safe and share them with your child.</p>
            <p>Your child can now log in to Buddy using these credentials.</p>
            """,
            subtype="html"
        )
        await self.fastmail.send_message(message) 