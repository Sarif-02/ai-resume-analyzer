import React from 'react'

interface ScoreBadgeProps {
    score: number
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
    let badgeClass = ''
    let label = ''

    if (score > 70) {
        badgeClass = 'bg-green-100 text-green-600'
        label = 'Strong'
    } else if (score > 49) {
        badgeClass = 'bg-yellow-100 text-yellow-600'
        label = 'Good Start'
    } else {
        badgeClass = 'bg-red-100 text-red-600'
        label = 'Needs Work'
    }

    return (
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${badgeClass}`}>
            <p>{label}</p>
        </div>
    )
}

export default ScoreBadge
