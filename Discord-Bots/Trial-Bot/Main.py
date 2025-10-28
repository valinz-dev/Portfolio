import os
import discord
from discord.ext import commands
from dotenv import load_dotenv
import openai

# Load keys
load_dotenv()
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# Discord Intents
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f" Logged in as {bot.user}")

@bot.command()
async def hello(ctx):
    await ctx.send(
        f"Hello {ctx.author.mention}, welcome to the Trial bot!\n"
        "Use `!trial @username reason:...` and we will give you a fair trial!"
    )

@bot.command()
async def trial(ctx, member: discord.Member, *, reason: str = "No reason given"):
    # Special case: 
    if f"{member.name}.{member.discriminator}" == "thunder.2240":
        verdict = "GUILTY. Sentence: death by lagspike💀"
    else:
        # prompt
        prompt = f"""
You are a sarcastic but fair courtroom judge in a fictional Discord court.
You must evaluate the following accusation as if it were real testimony:

"{reason}"

Guidelines:
- If the action described involves any wrongdoing, bad behavior, or questionable intent, rule GUILTY.
- Only rule NOT GUILTY if the reason clearly shows no misbehavior or harm.
- Be witty but decisive in tone.
- Your entire response must be 1–2 short sentences and end with either 'GUILTY' or 'NOT GUILTY'.
"""

        try:
            resp = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=80,
                temperature=0.7,
            )
            verdict = resp.choices[0].message.content.strip()
        except Exception as e:
            print(f"❌ OpenAI Error: {e}")
            verdict = "NOT GUILTY. (AI judge is unavailable—technical recess.)"

    embed = discord.Embed(
        title="⚖️ Trial Verdict",
        description=f"**Defendant:** {member.mention}\n**Reason:** {reason}\n**Verdict:** {verdict}",
        color=discord.Color.dark_grey()
    )
    embed.set_footer(text=f"Judge: {ctx.author.display_name}")
    await ctx.send(embed=embed)

bot.run(DISCORD_TOKEN)
