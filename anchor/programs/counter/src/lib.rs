#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe");

#[program]
pub mod counter {
    use super::*;

    // Original counter instructions (kept for backward compatibility)
    pub fn close(_ctx: Context<CloseCounter>) -> Result<()> {
        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.counter.count = ctx.accounts.counter.count.checked_sub(1).unwrap();
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.counter.count = ctx.accounts.counter.count.checked_add(1).unwrap();
        Ok(())
    }

    pub fn initialize(_ctx: Context<InitializeCounter>) -> Result<()> {
        Ok(())
    }

    pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
        ctx.accounts.counter.count = value.clone();
        Ok(())
    }

    // TigerTrust User Profile Instructions
    
    /// Initialize a new User Profile PDA for a wallet
    pub fn initialize_user_profile(
        ctx: Context<InitializeUserProfile>,
        human_verified: bool,
    ) -> Result<()> {
        let profile = &mut ctx.accounts.user_profile;
        let clock = Clock::get()?;
        
        profile.wallet = ctx.accounts.user.key();
        profile.tiger_score = 300; // Base score
        profile.tier = Tier::Silver;
        profile.human_verified = human_verified;
        profile.total_loans = 0;
        profile.successful_repayments = 0;
        profile.defaults = 0;
        profile.total_borrowed = 0;
        profile.total_repaid = 0;
        profile.outstanding_debt = 0;
        profile.created_at = clock.unix_timestamp;
        profile.last_score_update = clock.unix_timestamp;
        profile.bump = ctx.bumps.user_profile;
        
        msg!("User profile initialized for: {}", profile.wallet);
        msg!("Initial TigerScore: {}", profile.tiger_score);
        
        Ok(())
    }
    
    /// Update TigerScore and Tier (called by authorized backend service)
    pub fn update_tiger_score(
        ctx: Context<UpdateTigerScore>,
        new_score: u16,
        new_tier: Tier,
    ) -> Result<()> {
        let profile = &mut ctx.accounts.user_profile;
        let clock = Clock::get()?;
        
        // Validate score is within bounds
        require!(new_score <= 1000, TigerTrustError::InvalidScore);
        
        let old_score = profile.tiger_score;
        let old_tier = profile.tier;
        
        profile.tiger_score = new_score;
        profile.tier = new_tier;
        profile.last_score_update = clock.unix_timestamp;
        
        msg!("TigerScore updated for: {}", profile.wallet);
        msg!("Score: {} -> {}", old_score, new_score);
        msg!("Tier: {:?} -> {:?}", old_tier, new_tier);
        
        Ok(())
    }
    
    /// Record a new loan
    pub fn record_loan(
        ctx: Context<UpdateUserProfile>,
        amount: u64,
    ) -> Result<()> {
        let profile = &mut ctx.accounts.user_profile;
        
        profile.total_loans = profile.total_loans.checked_add(1).unwrap();
        profile.total_borrowed = profile.total_borrowed.checked_add(amount).unwrap();
        profile.outstanding_debt = profile.outstanding_debt.checked_add(amount).unwrap();
        
        msg!("Loan recorded: {} lamports for {}", amount, profile.wallet);
        
        Ok(())
    }
    
    /// Record a successful repayment
    pub fn record_repayment(
        ctx: Context<UpdateUserProfile>,
        amount: u64,
        is_default: bool,
    ) -> Result<()> {
        let profile = &mut ctx.accounts.user_profile;
        
        if is_default {
            profile.defaults = profile.defaults.checked_add(1).unwrap();
            msg!("Default recorded for {}", profile.wallet);
        } else {
            profile.successful_repayments = profile.successful_repayments.checked_add(1).unwrap();
            msg!("Successful repayment recorded for {}", profile.wallet);
        }
        
        profile.total_repaid = profile.total_repaid.checked_add(amount).unwrap();
        profile.outstanding_debt = profile.outstanding_debt.saturating_sub(amount);
        
        Ok(())
    }
    
    /// Update human verification status
    pub fn update_human_verification(
        ctx: Context<UpdateUserProfile>,
        verified: bool,
    ) -> Result<()> {
        let profile = &mut ctx.accounts.user_profile;
        profile.human_verified = verified;
        
        msg!("Human verification updated: {} for {}", verified, profile.wallet);
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeCounter<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  init,
  space = 8 + Counter::INIT_SPACE,
  payer = payer
    )]
    pub counter: Account<'info, Counter>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseCounter<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  mut,
  close = payer, // close account and return lamports to payer
    )]
    pub counter: Account<'info, Counter>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
}

// TigerTrust contexts

#[derive(Accounts)]
pub struct InitializeUserProfile<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + UserProfile::INIT_SPACE,
        seeds = [b"user_profile", user.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateTigerScore<'info> {
    #[account(
        mut,
        seeds = [b"user_profile", user_profile.wallet.as_ref()],
        bump = user_profile.bump
    )]
    pub user_profile: Account<'info, UserProfile>,

    /// The wallet that owns this profile (not necessarily signer)
    /// CHECK: This is just used for reference
    pub wallet: AccountInfo<'info>,

    /// Authority that can update scores (backend service)
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateUserProfile<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"user_profile", user.key().as_ref()],
        bump = user_profile.bump
    )]
    pub user_profile: Account<'info, UserProfile>,
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    count: u8,
}

#[account]
#[derive(InitSpace)]
pub struct UserProfile {
    /// Wallet address that owns this profile
    pub wallet: Pubkey,
    
    /// TigerScore (0-1000)
    pub tiger_score: u16,
    
    /// Risk tier
    pub tier: Tier,
    
    /// Human verification status
    pub human_verified: bool,
    
    /// Loan statistics
    pub total_loans: u32,
    pub successful_repayments: u32,
    pub defaults: u32,
    
    /// Financial statistics (in lamports)
    pub total_borrowed: u64,
    pub total_repaid: u64,
    pub outstanding_debt: u64,
    
    /// Timestamps
    pub created_at: i64,
    pub last_score_update: i64,
    
    /// PDA bump seed
    pub bump: u8,
}

// Enums

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug, InitSpace)]
pub enum Tier {
    Bronze,   // 0-299
    Silver,   // 300-499
    Gold,     // 500-699
    Platinum, // 700-849
    Diamond,  // 850-1000
}

// Errors

#[error_code]
pub enum TigerTrustError {
    #[msg("Invalid score value. Score must be between 0 and 1000.")]
    InvalidScore,
    
    #[msg("Unauthorized. Only the authority can perform this action.")]
    Unauthorized,
    
    #[msg("User profile already exists.")]
    ProfileAlreadyExists,
    
    #[msg("User profile not found.")]
    ProfileNotFound,
}
