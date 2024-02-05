Pod::Spec.new do |s|
  s.name           = 'TiFTravelEstimates'
  s.version        = '1.0.0'
  s.summary        = 'A sample project summary'
  s.description    = 'A sample project description'
  s.author         = ''
  s.license        = 'MIT'
  s.platform       = :ios, '13.0'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.source         = { git: 'https://github.com/tifapp/FitnessProject.git', :tag => s.version }
  s.source_files   = 'Sources/TiFTravelEstimates/*.swift'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
